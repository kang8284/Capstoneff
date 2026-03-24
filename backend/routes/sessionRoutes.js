const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

// =======================
// 세션 관리 (보조 기능)
// =======================
router.get('/sessions', controller.getSessions);
router.post('/sessions', controller.createSession);
router.delete('/sessions/:id', controller.deleteSession);

// =======================
// 핵심 기능
// =======================
router.post('/process', controller.processData);
router.get('/result', controller.getResult);

// =======================
// 관리자
// =======================
router.delete('/admin/reset', controller.resetDatabase);

module.exports = router;