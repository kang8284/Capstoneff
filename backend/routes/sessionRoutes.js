// backend/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.get('/sessions', controller.getSessions);
router.post('/sessions', controller.createSession);
router.delete('/sessions/:id', controller.deleteSession);

module.exports = router;