const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID người dùng là bắt buộc'],
    },
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
      maxlength: [30, 'Tên danh mục tối đa 30 ký tự'],
    },
    icon: {
      type: String,
      required: [true, 'Icon danh mục là bắt buộc'],
      default: '📌',
    },
    color: {
      type: String,
      required: [true, 'Màu sắc danh mục là bắt buộc'],
      default: '#64748b',
    },
    type: {
      type: String,
      required: [true, 'Loại giao dịch là bắt buộc'],
      enum: {
        values: ['expense', 'income'],
        message: 'Loại danh mục không hợp lệ',
      },
    },
    isCustom: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Index for fast query
categorySchema.index({ userId: 1, type: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
