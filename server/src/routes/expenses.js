const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const { validateAmount, validateCategory, validateType, validateDescription, validateDate } = require('../utils/validators');
const { expensesCreatedTotal, expensesDeletedTotal, activeExpensesGauge } = require('../middleware/metrics');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Tất cả route chi tiêu yêu cầu đăng nhập
router.use(authMiddleware);

// Helper: sync active gauge
async function syncGauge() {
  try {
    const count = await Expense.countDocuments();
    activeExpensesGauge.set(count);
  } catch (_) {}
}

// ──────────────────────────────────────────────────────────
// GET /api/expenses
// Query params: month (YYYY-MM), category, type, page, limit
// ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = { userId: req.user._id };

    // Lọc theo loại (income | expense)
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Lọc theo tháng: ?month=2025-07
    if (req.query.month) {
      const [year, month] = req.query.month.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month)) {
        const start = new Date(year, month - 1, 1);
        const end   = new Date(year, month, 1);
        filter.date = { $gte: start, $lt: end };
      }
    }

    // Lọc theo danh mục
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(filter),
    ]);

    res.json({
      expenses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/expenses error:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách chi tiêu' });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/expenses/stats — Tổng kết Thu/Chi theo tháng + danh mục
// ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const baseFilter = { userId: req.user._id };
    if (req.query.month) {
      const [year, month] = req.query.month.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month)) {
        baseFilter.date = {
          $gte: new Date(year, month - 1, 1),
          $lt:  new Date(year, month, 1),
        };
      }
    }

    const categoryFilter = { ...baseFilter };
    if (req.query.type) {
      categoryFilter.type = req.query.type;
    } else {
      categoryFilter.type = 'expense'; // Mặc định hiển thị breakdown của chi tiêu nếu xem tất cả
    }

    const [byCategory, byMonth, totals] = await Promise.all([
      // Tổng theo danh mục (của type đang chọn)
      Expense.aggregate([
        { $match: categoryFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      // Tổng 6 tháng gần nhất (của cả thu và chi)
      Expense.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]),
      // Grand totals thu và chi trong kỳ
      Expense.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    let totalExpense = 0, countExpense = 0;
    let totalIncome = 0, countIncome = 0;
    totals.forEach(item => {
      if (item._id === 'expense') {
        totalExpense = item.total;
        countExpense = item.count;
      } else if (item._id === 'income') {
        totalIncome = item.total;
        countIncome = item.count;
      }
    });

    const monthMap = new Map();
    byMonth.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { year: item._id.year, month: item._id.month, income: 0, expense: 0 });
      }
      const entry = monthMap.get(key);
      if (item._id.type === 'income') entry.income = item.total;
      else entry.expense = item.total;
    });
    const byMonthArr = Array.from(monthMap.values()).slice(0, 6).reverse();

    const activeTotal = req.query.type === 'income' ? totalIncome : totalExpense;
    const activeCount = req.query.type === 'income' ? countIncome : countExpense;

    res.json({
      byCategory,
      byMonth: byMonthArr,
      total: activeTotal,
      count: activeCount,
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
    });
  } catch (err) {
    console.error('GET /api/expenses/stats error:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy thống kê' });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/expenses/:id
// ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ error: 'Không tìm thấy khoản chi' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/expenses — Thêm khoản chi/thu mới
// ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { amount, description, category, date, note, type = 'expense' } = req.body;

  // Validate
  if (!validateType(type)) {
    return res.status(400).json({ error: 'Loại giao dịch không hợp lệ' });
  }
  if (!validateAmount(amount)) {
    return res.status(400).json({ error: 'Số tiền không hợp lệ (phải là số dương, tối đa 1 tỷ)' });
  }
  if (!validateDescription(description)) {
    return res.status(400).json({ error: 'Mô tả không hợp lệ (1–200 ký tự)' });
  }
  if (!validateCategory(category)) {
    return res.status(400).json({ error: 'Danh mục không hợp lệ' });
  }
  if (!validateDate(date)) {
    return res.status(400).json({ error: 'Ngày không hợp lệ' });
  }

  try {
    const expense = await Expense.create({
      userId: req.user._id,
      type,
      amount: Number(amount),
      description: description.trim(),
      category,
      date: date ? new Date(date) : new Date(),
      note: note?.trim() || '',
    });

    expensesCreatedTotal.inc();
    syncGauge();

    res.status(201).json(expense);
  } catch (err) {
    console.error('POST /api/expenses error:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo khoản chi' });
  }
});

// ──────────────────────────────────────────────────────────
// PUT /api/expenses/:id — Sửa khoản chi/thu
// ──────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  const { amount, description, category, date, note, type } = req.body;
  const update = {};

  if (type !== undefined) {
    if (!validateType(type)) {
      return res.status(400).json({ error: 'Loại giao dịch không hợp lệ' });
    }
    update.type = type;
  }
  if (amount !== undefined) {
    if (!validateAmount(amount)) {
      return res.status(400).json({ error: 'Số tiền không hợp lệ' });
    }
    update.amount = Number(amount);
  }
  if (description !== undefined) {
    if (!validateDescription(description)) {
      return res.status(400).json({ error: 'Mô tả không hợp lệ' });
    }
    update.description = description.trim();
  }
  if (category !== undefined) {
    if (!validateCategory(category)) {
      return res.status(400).json({ error: 'Danh mục không hợp lệ' });
    }
    update.category = category;
  }
  if (date !== undefined) {
    if (!validateDate(date)) {
      return res.status(400).json({ error: 'Ngày không hợp lệ' });
    }
    update.date = new Date(date);
  }
  if (note !== undefined) update.note = note.trim();

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
  }

  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ error: 'Không tìm thấy khoản chi' });
    res.json(expense);
  } catch (err) {
    console.error('PUT /api/expenses/:id error:', err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật' });
  }
});

// ──────────────────────────────────────────────────────────
// DELETE /api/expenses/:id — Xoá khoản chi/thu
// ──────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ error: 'Không tìm thấy khoản chi' });

    expensesDeletedTotal.inc();
    syncGauge();

    res.json({ message: 'Đã xoá thành công', id: req.params.id });
  } catch (err) {
    console.error('DELETE /api/expenses/:id error:', err);
    res.status(500).json({ error: 'Lỗi server khi xoá' });
  }
});

module.exports = router;
