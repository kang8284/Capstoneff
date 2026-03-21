const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

// 세션 관련
router.get('/sessions', controller.getSessions);
router.post('/sessions', controller.createSession);
router.delete('/sessions/:id', controller.deleteSession);

// 🔥 추가 (핵심)
router.post('/process', controller.processData);
router.get('/result', controller.getResult);

module.exports = router;