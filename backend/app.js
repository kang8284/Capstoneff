const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 이미지 정적 접근
app.use('/uploads', express.static('uploads'));

/* =========================
   MongoDB Atlas 연결
========================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB Atlas 연결 성공'))
  .catch(err => console.error('DB 연결 실패:', err));

/* =========================
   Schema (🔥 name 추가)
========================= */
const outfitSchema = new mongoose.Schema({
  gender: String,
  bodyType: String,
  style: String,
  category: String,
  name: String,        // 🔥 추가
  imageUrl: String
});

const Outfit = mongoose.model('Outfit', outfitSchema);

/* =========================
   Multer 설정
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================
   1. 업로드 API
========================= */
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    const { height, weight, gender, style } = req.body;
    const image = req.file;

    res.json({
      message: '성공',
      data: {
        height,
        weight,
        gender,
        style,
        imageUrl: image
          ? `http://localhost:3000/uploads/${image.filename}`
          : null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/* =========================
   2. 추천 API (최종 안정화)
========================= */
app.post('/api/recommend', async (req, res) => {
  try {
    const { gender, style, bodyType: bodyTypeFromClient } = req.body;

    const bodyTypes = ['스트레이트', '웨이브', '내추럴'];
    const bodyType = bodyTypes.includes(bodyTypeFromClient)
      ? bodyTypeFromClient
      : bodyTypes[Math.floor(Math.random() * bodyTypes.length)];

    console.log('랜덤 bodyType:', bodyType);

    // 🔥 DB 조회
    const results = await Outfit.find({
      gender,
      style,
      bodyType
    });

    // 🔥 카테고리 분리
    const top = results.filter(i => i.category === 'top');
    const bottom = results.filter(i => i.category === 'bottom');
    const jacket = results.filter(i => i.category === 'jacket');

    // 🔥 항상 배열 보장 + name 포함 구조 유지
    res.json({
      bodyType,
      top: top ?? [],
      bottom: bottom ?? [],
      jacket: jacket ?? []
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: '추천 실패',
      bodyType: null,
      top: [],
      bottom: [],
      jacket: []
    });
  }
});

/* =========================
   3. 가상 피팅 API
========================= */

const CAT_LABELS   = { top: '상의', bottom: '하의', outer: '아우터', accessory: '악세서리', shoes: '신발', other: '기타' };
const VITON_MAP    = { top: 'upper_body', bottom: 'lower_body', outer: 'upper_body' };
const VITON_ORDER  = ['top', 'bottom', 'outer'];
const DISPLAY_ONLY = ['accessory', 'shoes', 'other'];

// 임시 job 저장소 (서버 재시작 시 초기화됨)
const fittingJobs = new Map();

async function uploadToCloudinary(filePath) {
  const result = await cloudinary.uploader.upload(filePath, { folder: 'fitting' });
  return result.secure_url;
}

async function runReplicate(personUrl, garmentUrl, category, token) {
  // 예측 시작
  const startRes = await fetch('https://api.replicate.com/v1/models/yisol/idm-vton/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        human_img:    personUrl,
        garm_img:     garmentUrl,
        garment_des:  category,
        category:     category,
        is_checked:       true,
        is_checked_crop:  false,
        denoise_steps:    30,
        seed:             42,
      }
    })
  });
  let prediction = await startRes.json();
  if (prediction.error) throw new Error(prediction.error);

  // 완료될 때까지 3초마다 폴링
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    await new Promise(r => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    prediction = await pollRes.json();
  }

  if (prediction.status === 'failed') throw new Error(prediction.error || 'Replicate 피팅 실패');
  const output = prediction.output;
  return Array.isArray(output) ? output[0] : output;
}

async function processJob(jobId, files) {
  const job   = fittingJobs.get(jobId);
  const token = process.env.REPLICATE_API_TOKEN;

  try {
    job.currentStep = '인물 사진 업로드 중...';
    const personUrl = await uploadToCloudinary(files.person[0].path);
    let currentPersonUrl = personUrl;

    // VITON 지원 카테고리: 순서대로 피팅 적용 (이전 결과가 다음 인물 사진이 됨)
    for (const key of VITON_ORDER) {
      if (!files[key]) continue;
      const stepIdx = job.steps.findIndex(s => s.key === key);
      job.steps[stepIdx].status = 'processing';
      job.currentStep = `${CAT_LABELS[key]} 피팅 중...`;

      const garmentUrl = await uploadToCloudinary(files[key][0].path);

      if (token) {
        const resultUrl = await runReplicate(currentPersonUrl, garmentUrl, VITON_MAP[key], token);
        currentPersonUrl = resultUrl;
        job.steps[stepIdx].resultUrl = resultUrl;
      } else {
        // 토큰 없음 — mock: 원본 인물 사진 유지, 의류 URL만 저장
        job.steps[stepIdx].resultUrl = garmentUrl;
        job.steps[stepIdx].mock = true;
      }
      job.steps[stepIdx].status = 'done';
    }

    // 참고용 카테고리: Cloudinary 업로드만
    for (const key of DISPLAY_ONLY) {
      if (!files[key]) continue;
      const stepIdx = job.steps.findIndex(s => s.key === key);
      job.steps[stepIdx].status = 'processing';
      const url = await uploadToCloudinary(files[key][0].path);
      job.steps[stepIdx].resultUrl = url;
      job.steps[stepIdx].status = 'done';
    }

    job.status    = 'done';
    job.resultUrl = currentPersonUrl;   // 최종 피팅된 인물 사진
    job.mock      = !token;
    job.currentStep = '완료';

  } catch (err) {
    job.status    = 'failed';
    job.error     = err.message;
    job.currentStep = '오류 발생';
    console.error('[피팅 오류]', err.message);
  }
}

const fittingUpload = multer({ storage }).fields([
  { name: 'person',    maxCount: 1 },
  { name: 'top',       maxCount: 1 },
  { name: 'bottom',    maxCount: 1 },
  { name: 'outer',     maxCount: 1 },
  { name: 'accessory', maxCount: 1 },
  { name: 'shoes',     maxCount: 1 },
  { name: 'other',     maxCount: 1 },
]);

// POST /api/fitting — job 시작, jobId 즉시 반환
app.post('/api/fitting', fittingUpload, (req, res) => {
  if (!req.files?.person) return res.status(400).json({ error: '인물 사진 필요' });

  const jobId = Date.now().toString();
  const steps = [];
  for (const key of [...VITON_ORDER, ...DISPLAY_ONLY]) {
    if (req.files[key]) {
      steps.push({ key, label: CAT_LABELS[key], status: 'pending', viton: key in VITON_MAP });
    }
  }

  fittingJobs.set(jobId, { status: 'processing', steps, resultUrl: null, currentStep: '시작 중...', error: null });
  res.json({ jobId });

  processJob(jobId, req.files).catch(console.error);
});

// GET /api/fitting/:jobId — 상태 폴링
app.get('/api/fitting/:jobId', (req, res) => {
  const job = fittingJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

/* =========================
   서버 실행
========================= */
app.listen(3000, () => {
  console.log('서버 실행: http://localhost:3000');
});