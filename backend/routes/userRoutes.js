const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users → 모든 아이템 조회
router.get('/', userController.getUsers);

// POST /api/users → 아이템 생성
router.post('/', userController.createUser);

// DELETE /api/users/:id → 아이템 삭제
router.delete('/:id', userController.deleteUser);

module.exports = router;