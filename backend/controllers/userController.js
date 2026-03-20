const userModel = require('../models/userModel');

// 전체 아이템 조회
exports.getUsers = (req, res) => {
  userModel.getAllItems((err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// 아이템 생성
exports.createUser = (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) throw new Error('Title 필요');

    userModel.createItem(title, description, (err, result) => {
      if (err) return res.status(500).json({ message: 'DB insert 실패', error: err });
      res.json({ message: 'Item created' });
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
};

// 아이템 삭제
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  userModel.deleteItem(id, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Item deleted' });
  });
};