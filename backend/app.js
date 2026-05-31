const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

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

        const python = spawn('python', ['quality_check.py', imagePath], {
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

            return res.status(500).json({
                valid: false,
                reasons: ['Python 품질검사 파일을 실행하지 못했습니다.'],
            });
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
   현재는 mock, 나중에 실제 체형분석 모델 연결
========================= */
app.post('/api/body-analysis', upload.single('image'), async (req, res) => {
    try {
        const { height, weight, gender, style } = req.body;

        // =========================
        // 임시 체형 분석
        // 나중에 Python AI 결과로 교체
        // =========================

        const bodyTypes = [
            'straight',
            'wave',
            'natural',
        ];

        const bodyType =
            bodyTypes[Math.floor(Math.random() * bodyTypes.length)];

        console.log('분석 결과:', bodyType);

        // =========================
        // MongoDB 추천 조회
        // =========================

        const results = await Outfit.find({
            gender,
            bodyType,
            style,
        });

        const top = results.filter(
            (item) => item.category === 'top'
        );

        const bottom = results.filter(
            (item) => item.category === 'bottom'
        );

        const inner = results.filter(
            (item) => item.category === 'inner'
        );

        const outer = results.filter(
            (item) => item.category === 'outer'
        );

        const shoe = results.filter(
            (item) => item.category === 'shoe'
        );

        // =========================
        // 응답
        // =========================

        res.json({
            success: true,

            analysis: {
                bodyType,
                height,
                weight,
                gender,
                style,
            },

            recommendation: {
                top,
                bottom,
                inner,
                outer,
                shoe,
            },

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
                imageUrl: image ? `http://localhost:3000/uploads/${image.filename}` : null,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

/* =========================
   값 매핑 (한국어 → DB 영어)
========================= */
const GENDER_MAP   = { '남자': 'male', '여자': 'female', male: 'male', female: 'female' };
const BODY_MAP     = { '스트레이트': 'straight', '웨이브': 'wave', '내추럴': 'natural', straight: 'straight', wave: 'wave', natural: 'natural' };
const STYLE_MAP    = { '캐주얼': 'casual', '스트릿': 'street', '포멀': 'formal', casual: 'casual', street: 'street', formal: 'formal' };

/* =========================
   2. 추천 API
========================= */
app.post('/api/recommend', async (req, res) => {
    try {
        const { gender, style, bodyType: bodyTypeFromClient } = req.body;

        const dbGender   = GENDER_MAP[gender]              ?? 'male';
        const dbBodyType = BODY_MAP[bodyTypeFromClient]    ?? 'straight';
        const dbStyle    = STYLE_MAP[style]                ?? null;

        console.log('recommend query:', { dbGender, dbBodyType, dbStyle });

        const query = { gender: dbGender, bodyType: dbBodyType };
        if (dbStyle) query.style = dbStyle;

        const results = await Outfit.find(query);

        const top    = results.filter((i) => i.category === 'top');
        const bottom = results.filter((i) => i.category === 'bottom');
        const jacket = results.filter((i) => i.category === 'outer');

        res.json({
            bodyType: bodyTypeFromClient,
            top:    top    ?? [],
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
   3. 가상 피팅 API
========================= */

const CAT_LABELS = {
    top: '상의',
    bottom: '하의',
    outer: '아우터',
    accessory: '악세서리',
    shoes: '신발',
    other: '기타',
};

const VITON_MAP = {
    top: 'upper_body',
    bottom: 'lower_body',
    outer: 'upper_body',
};

const VITON_ORDER = ['top', 'bottom', 'outer'];
const DISPLAY_ONLY = ['accessory', 'shoes', 'other'];

const fittingJobs = new Map();

async function uploadToCloudinary(filePath) {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: 'fitting',
    });

    return result.secure_url;
}

async function runReplicate(personUrl, garmentUrl, category, token) {
    const startRes = await fetch('https://api.replicate.com/v1/models/yisol/idm-vton/predictions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: {
                human_img: personUrl,
                garm_img: garmentUrl,
                garment_des: category,
                category: category,
                is_checked: true,
                is_checked_crop: false,
                denoise_steps: 30,
                seed: 42,
            },
        }),
    });

    let prediction = await startRes.json();

    if (prediction.error) {
        throw new Error(prediction.error);
    }

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
        await new Promise((r) => setTimeout(r, 3000));

        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        prediction = await pollRes.json();
    }

    if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'Replicate 피팅 실패');
    }

    const output = prediction.output;

    return Array.isArray(output) ? output[0] : output;
}

async function processJob(jobId, files) {
    const job = fittingJobs.get(jobId);
    const token = process.env.REPLICATE_API_TOKEN;

    try {
        job.currentStep = '인물 사진 업로드 중...';

        const personUrl = await uploadToCloudinary(files.person[0].path);
        let currentPersonUrl = personUrl;

        for (const key of VITON_ORDER) {
            if (!files[key]) continue;

            const stepIdx = job.steps.findIndex((s) => s.key === key);

            job.steps[stepIdx].status = 'processing';
            job.currentStep = `${CAT_LABELS[key]} 피팅 중...`;

            const garmentUrl = await uploadToCloudinary(files[key][0].path);

            if (token) {
                const resultUrl = await runReplicate(currentPersonUrl, garmentUrl, VITON_MAP[key], token);

                currentPersonUrl = resultUrl;
                job.steps[stepIdx].resultUrl = resultUrl;
            } else {
                job.steps[stepIdx].resultUrl = garmentUrl;
                job.steps[stepIdx].mock = true;
            }

            job.steps[stepIdx].status = 'done';
        }

        for (const key of DISPLAY_ONLY) {
            if (!files[key]) continue;

            const stepIdx = job.steps.findIndex((s) => s.key === key);

            job.steps[stepIdx].status = 'processing';

            const url = await uploadToCloudinary(files[key][0].path);

            job.steps[stepIdx].resultUrl = url;
            job.steps[stepIdx].status = 'done';
        }

        job.status = 'done';
        job.resultUrl = currentPersonUrl;
        job.mock = !token;
        job.currentStep = '완료';
    } catch (err) {
        job.status = 'failed';
        job.error = err.message;
        job.currentStep = '오류 발생';

        console.error('[피팅 오류]', err.message);
    }
}

const fittingUpload = multer({ storage }).fields([
    { name: 'person', maxCount: 1 },
    { name: 'top', maxCount: 1 },
    { name: 'bottom', maxCount: 1 },
    { name: 'outer', maxCount: 1 },
    { name: 'accessory', maxCount: 1 },
    { name: 'shoes', maxCount: 1 },
    { name: 'other', maxCount: 1 },
]);

app.post('/api/fitting', fittingUpload, (req, res) => {
    if (!req.files?.person) {
        return res.status(400).json({
            error: '인물 사진 필요',
        });
    }

    const jobId = Date.now().toString();
    const steps = [];

    for (const key of [...VITON_ORDER, ...DISPLAY_ONLY]) {
        if (req.files[key]) {
            steps.push({
                key,
                label: CAT_LABELS[key],
                status: 'pending',
                viton: key in VITON_MAP,
            });
        }
    }

    fittingJobs.set(jobId, {
        status: 'processing',
        steps,
        resultUrl: null,
        currentStep: '시작 중...',
        error: null,
    });

    res.json({ jobId });

    processJob(jobId, req.files).catch(console.error);
});

app.get('/api/fitting/:jobId', (req, res) => {
    const job = fittingJobs.get(req.params.jobId);

    if (!job) {
        return res.status(404).json({
            error: 'Job not found',
        });
    }

    res.json(job);
});

/* =========================
   4. 간편 가상 피팅 API
   - JSON으로 base64 인물 이미지 수신
   - MongoDB에서 테스트 룩 자동 선택
   - Replicate IDM-VTON으로 피팅
========================= */
app.post('/api/fitting-simple', async (req, res) => {
    const { personImage, gender = '남자' } = req.body;
    if (!personImage) return res.status(400).json({ error: '인물 이미지 필요' });

    const dbGender = GENDER_MAP[gender] ?? 'male';

    // MongoDB에서 테스트 상의 1개 선택
    const outfit = await Outfit.findOne({ gender: dbGender, category: 'top' }).catch(() => null);
    if (!outfit?.imageUrl) {
        return res.status(404).json({ error: `DB에 ${dbGender} 상의 데이터 없음` });
    }

    const jobId = Date.now().toString();
    fittingJobs.set(jobId, {
        status: 'processing',
        steps: [{ key: 'top', label: '상의', status: 'pending', viton: true }],
        resultUrl: null,
        outfitName: outfitName,
        outfitImageUrl: outfit.imageUrl,
        currentStep: '시작 중...',
        error: null,
        mock: false,
    });

    const outfitName = outfit.name || `${outfit.style ?? ''} ${outfit.bodyType ?? ''} 상의`.trim();
    res.json({ jobId, outfitName, outfitImageUrl: outfit.imageUrl });

    (async () => {
        const job = fittingJobs.get(jobId);
        const token = process.env.REPLICATE_API_TOKEN;
        try {
            job.currentStep = '인물 사진 업로드 중...';
            const uploadResult = await cloudinary.uploader.upload(personImage, { folder: 'fitting' });
            const personUrl = uploadResult.secure_url;

            job.steps[0].status = 'processing';
            job.currentStep = '상의 피팅 중...';

            if (token) {
                const resultUrl = await runReplicate(personUrl, outfit.imageUrl, 'upper_body', token);
                job.steps[0].resultUrl = resultUrl;
                job.resultUrl = resultUrl;
            } else {
                // 토큰 없으면 의상 이미지 그대로 반환 (mock)
                job.steps[0].resultUrl = outfit.imageUrl;
                job.resultUrl = outfit.imageUrl;
                job.mock = true;
            }

            job.steps[0].status = 'done';
            job.status = 'done';
            job.currentStep = '완료';
        } catch (err) {
            job.status = 'failed';
            job.error = err.message;
            job.currentStep = '오류 발생';
            console.error('[fitting-simple 오류]', err.message);
        }
    })().catch(console.error);
});

/* =========================
   서버 실행
========================= */
app.listen(3000, () => {
    console.log('서버 실행: http://localhost:3000');
});
