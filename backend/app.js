const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

function getLocalIP() {
    for (const ifaces of Object.values(os.networkInterfaces())) {
        for (const iface of ifaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}
const LOCAL_IP = getLocalIP();

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// 이미지 정적 접근
app.use('/uploads', express.static('uploads'));

/* =========================
MongoDB Atlas 연결
========================= */
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB Atlas 연결 성공'))
    .catch((err) => console.error('DB 연결 실패:', err));

/* =========================
Schema
========================= */
const outfitSchema = new mongoose.Schema({
    gender: String,
    bodyType: String,
    style: String,
    category: String,
    name: String,
    imageUrl: String,
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
    },
});

const upload = multer({ storage });

/* =========================
사진 품질 검사 API
Python quality_check.py 실행
========================= */
app.post('/api/check-quality', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                valid: false,
                reasons: ['검사할 이미지가 없습니다.'],
            });
        }

        const imagePath = req.file.path;

        // ✅ FIX: python3 → py -3.12
        const python = spawn('py', [
            '-3.12',
            'quality_check.py',
            imagePath
        ], {
            cwd: __dirname,
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8',
            },
        });

        let resultData = '';
        let errorData = '';

        python.stdout.on('data', (data) => {
            resultData += data.toString('utf8');
        });

        python.stderr.on('data', (data) => {
            errorData += data.toString('utf8');
        });

        python.on('close', (code) => {
            if (res.headersSent) return;

            if (errorData) {
                console.error('Python stderr:', errorData);
            }

            if (code !== 0 && !resultData) {
                return res.status(500).json({
                    valid: false,
                    reasons: ['사진 품질 검사 실행 중 오류가 발생했습니다.'],
                });
            }

            try {
                const qualityResult = JSON.parse(resultData);

                return res.json({
                    ...qualityResult,
                    imageUrl: `http://localhost:3000/uploads/${req.file.filename}`,
                });
            } catch (err) {
                console.error('품질검사 결과 파싱 실패:', err);
                console.error('Python stdout:', resultData);

                return res.status(500).json({
                    valid: false,
                    reasons: ['품질검사 결과를 처리하지 못했습니다.'],
                });
            }
        });

        python.on('error', (err) => {
            console.error('Python 실행 실패:', err);

            if (!res.headersSent) {
                res.status(500).json({
                    valid: false,
                    reasons: ['Python 품질검사 파일을 실행하지 못했습니다.'],
                });
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            valid: false,
            reasons: ['사진 품질 검사 중 서버 오류가 발생했습니다.'],
        });
    }
});

/* =========================
체형 분석 API
========================= */
app.post('/api/body-analysis', upload.single('image'), async (req, res) => {
    try {
        const { height, weight, gender, style } = req.body;

        const bodyTypes = ['straight', 'wave', 'natural'];
        const bodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];

        const results = await Outfit.find({ gender, bodyType, style });

        const top = results.filter(i => i.category === 'top');
        const bottom = results.filter(i => i.category === 'bottom');
        const inner = results.filter(i => i.category === 'inner');
        const outer = results.filter(i => i.category === 'outer');
        const shoe = results.filter(i => i.category === 'shoe');

        res.json({
            success: true,
            analysis: { bodyType, height, weight, gender, style },
            recommendation: { top, bottom, inner, outer, shoe },
            imageUrl: req.file
                ? `http://localhost:3000/uploads/${req.file.filename}`
                : null,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: '체형 분석 실패',
        });
    }
});

/* =========================
업로드 API
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
                    : null,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

/* =========================
값 매핑
========================= */
const GENDER_MAP = { '남자': 'male', '여자': 'female', male: 'male', female: 'female' };
const BODY_MAP = { '스트레이트': 'straight', '웨이브': 'wave', '내추럴': 'natural', straight: 'straight', wave: 'wave', natural: 'natural' };
const STYLE_MAP = { '캐주얼': 'casual', '스트릿': 'street', '포멀': 'formal', casual: 'casual', street: 'street', formal: 'formal' };

/* =========================
추천 API
========================= */
app.post('/api/recommend', async (req, res) => {
    try {
        const { gender, style, bodyType: bodyTypeFromClient } = req.body;

        const dbGender = GENDER_MAP[gender] ?? 'male';
        const dbBodyType = BODY_MAP[bodyTypeFromClient] ?? 'straight';
        const dbStyle = STYLE_MAP[style] ?? null;

        const query = { gender: dbGender, bodyType: dbBodyType };
        if (dbStyle) query.style = dbStyle;

        const results = await Outfit.find(query);

        const top = results.filter(i => i.category === 'top');
        const bottom = results.filter(i => i.category === 'bottom');
        const jacket = results.filter(i => i.category === 'outer');

        res.json({
            bodyType: bodyTypeFromClient,
            top: top ?? [],
            bottom: bottom ?? [],
            jacket: jacket ?? [],
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: '추천 실패',
            bodyType: null,
            top: [],
            bottom: [],
            jacket: [],
        });
    }
});

/* =========================
가상 피팅 API
========================= */
const fittingJobs = new Map();

const fittingUpload = multer({ storage }).fields([
    { name: 'person', maxCount: 1 },
    { name: 'top', maxCount: 1 },
    { name: 'bottom', maxCount: 1 },
    { name: 'outer', maxCount: 1 },
]);

app.post('/api/fitting', fittingUpload, (req, res) => {
    if (!req.files?.person) {
        return res.status(400).json({ error: '인물 사진 필요' });
    }

    const jobId = Date.now().toString();

    fittingJobs.set(jobId, {
        status: 'done',
        steps: [],
        resultUrl: null,
        currentStep: '완료',
        error: null,
    });

    res.json({ jobId });
});

app.get('/api/fitting/:jobId', (req, res) => {
    const job = fittingJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

/* =========================
<<<<<<< HEAD
   결과 이미지 내보내기 API
   base64 이미지 수신 → uploads/ 저장 → URL 반환
========================= */
app.post('/api/export-image', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: '이미지 없음' });

        const result = await cloudinary.uploader.upload(image, {
            folder: 'capstone-exports',
            resource_type: 'image',
        });

        res.json({ url: result.secure_url });
    } catch (err) {
        console.error('이미지 저장 실패:', err);
        res.status(500).json({ error: '이미지 저장 실패' });
    }
});

/* =========================
   결과 저장 페이지
   QR 스캔 → 자동 다운로드 + 버튼 fallback
========================= */
app.get('/api/save-result', (req, res) => {
    const imgUrl = req.query.url;
    if (!imgUrl) return res.status(400).send('이미지 URL이 없습니다.');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>결과 이미지 저장</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f3f0ff; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; padding: 24px; }
    img { max-width: 100%; max-height: 60vh; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
    .btn { margin-top: 28px; padding: 16px 40px; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; border: none; border-radius: 50px; font-size: 18px; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-block; box-shadow: 0 4px 16px rgba(124,58,237,0.4); }
    p { margin-top: 14px; color: #888; font-size: 13px; text-align: center; }
  </style>
</head>
<body>
  <img src="${imgUrl}" alt="결과 이미지" />
  <a id="dlBtn" class="btn" href="${imgUrl}" download="outfit-result.jpg">이미지 저장하기</a>
  <p>버튼을 눌러 이미지를 저장하세요<br>아이폰은 이미지를 길게 눌러 사진 앱에 저장할 수 있습니다</p>
  <script>
    (async () => {
      try {
        const res = await fetch('${imgUrl}');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'outfit-result.jpg';
        document.body.appendChild(a);
        a.click();
        document.getElementById('dlBtn').href = blobUrl;
      } catch(e) {}
    })();
  </script>
</body>
</html>`);
});

/* =========================
   서버 실행
=======
서버 실행
>>>>>>> 95d30d7 (파이썬 버전 고정)
========================= */
app.listen(3000, () => {
    console.log('서버 실행: http://localhost:3000');
});