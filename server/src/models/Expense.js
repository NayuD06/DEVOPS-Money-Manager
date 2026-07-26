const mongoose = require('mongoose');
const { ALL_VALID_CATEGORIES } = require('../utils/validators');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID người dùng là bắt buộc'],
    },
    type: {
      type: String,
      required: [true, 'Loại giao dịch là bắt buộc'],
      enum: {
        values: ['expense', 'income'],
        message: 'Loại giao dịch không hợp lệ',
      },
      default: 'expense',
    },
    amount: {
      type: Number,
      required: [true, 'Số tiền là bắt buộc'],
      min: [0.01, 'Số tiền phải lớn hơn 0'],
      max: [1_000_000_000, 'Số tiền quá lớn'],
    },
    description: {
      type: String,
      required: [true, 'Mô tả là bắt buộc'],
      trim: true,
      minlength: [1, 'Mô tả không được để trống'],
      maxlength: [200, 'Mô tả tối đa 200 ký tự'],
    },
    category: {
      type: String,
      required: [true, 'Danh mục là bắt buộc'],
      trim: true,
      maxlength: [50, 'Danh mục tối đa 50 ký tự'],
    },
    date: {
      type: Date,
      default: () => new Date(),
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Ghi chú tối đa 500 ký tự'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, type: 1 });
expenseSchema.index({ category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
