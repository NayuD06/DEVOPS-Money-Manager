const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authMiddleware } = require('../middleware/auth');

// Lấy danh sách danh mục tùy chỉnh của user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách danh mục' });
  }
});

// Thêm một danh mục tùy chỉnh mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, icon, color, type } = req.body;
    
    // Kiểm tra xem user đã tạo danh mục tên này chưa
    const existing = await Category.findOne({ userId: req.user._id, name });
    if (existing) {
      return res.status(400).json({ error: 'Tên danh mục này đã tồn tại!' });
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
      icon,
      color,
      type
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    res.status(500).json({ error: 'Lỗi server khi tạo danh mục mới' });
  }
});

// Xóa danh mục tùy chỉnh
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    
    await category.deleteOne();
    res.json({ message: 'Đã xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server khi xóa danh mục' });
  }
});

module.exports = router;
