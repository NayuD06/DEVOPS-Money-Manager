/**
 * Unit tests for SpendWise server
 *
 * Tests cover:
 *  1. Pure validator functions (no DB needed)
 *  2. API route integration tests (with supertest, mock mongoose/models/auth)
 */

const { validateAmount, validateCategory, validateType, validateDescription, validateDate, VALID_CATEGORIES, VALID_INCOME_CATEGORIES, ALL_VALID_CATEGORIES } = require('../src/utils/validators');

// ─────────────────────────────────────────────────────────────
// 1. Validator unit tests — pure functions, no DB
// ─────────────────────────────────────────────────────────────
describe('validateAmount', () => {
  test('returns true for positive numbers', () => {
    expect(validateAmount(100)).toBe(false);
    expect(validateAmount(0.01)).toBe(true);
    expect(validateAmount('500')).toBe(true);
    expect(validateAmount(999_999_999)).toBe(true);
  });

  test('returns false for zero', () => {
    expect(validateAmount(0)).toBe(false);
  });

  test('returns false for negative numbers', () => {
    expect(validateAmount(-1)).toBe(false);
    expect(validateAmount(-100)).toBe(false);
  });

  test('returns false for values above 1 billion', () => {
    expect(validateAmount(1_000_000_001)).toBe(false);
  });

  test('returns false for non-numeric values', () => {
    expect(validateAmount('abc')).toBe(false);
    expect(validateAmount(null)).toBe(false);
    expect(validateAmount(undefined)).toBe(false);
    expect(validateAmount(NaN)).toBe(false);
    expect(validateAmount(Infinity)).toBe(false);
  });
});

describe('validateCategory', () => {
  test('returns true for all valid expense & income categories', () => {
    ALL_VALID_CATEGORIES.forEach(cat => {
      expect(validateCategory(cat)).toBe(true);
    });
  });

  test('returns false for unknown categories', () => {
    expect(validateCategory('XYZ')).toBe(false);
    expect(validateCategory('food')).toBe(false);
    expect(validateCategory('')).toBe(false);
  });

  test('returns false for non-string values', () => {
    expect(validateCategory(null)).toBe(false);
    expect(validateCategory(123)).toBe(false);
    expect(validateCategory(undefined)).toBe(false);
  });
});

describe('validateType', () => {
  test('returns true for expense and income', () => {
    expect(validateType('expense')).toBe(true);
    expect(validateType('income')).toBe(true);
  });

  test('returns false for invalid type', () => {
    expect(validateType('other')).toBe(false);
    expect(validateType('')).toBe(false);
    expect(validateType(null)).toBe(false);
  });
});

describe('validateDescription', () => {
  test('returns true for valid descriptions', () => {
    expect(validateDescription('Cà phê sáng')).toBe(true);
    expect(validateDescription('a')).toBe(true);
    expect(validateDescription('x'.repeat(200))).toBe(true);
  });

  test('returns false for empty string', () => {
    expect(validateDescription('')).toBe(false);
    expect(validateDescription('   ')).toBe(false);
  });

  test('returns false for strings over 200 chars', () => {
    expect(validateDescription('x'.repeat(201))).toBe(false);
  });

  test('returns false for non-strings', () => {
    expect(validateDescription(null)).toBe(false);
    expect(validateDescription(123)).toBe(false);
  });
});

describe('validateDate', () => {
  test('returns true for valid date strings', () => {
    expect(validateDate('2025-07-15')).toBe(true);
    expect(validateDate('2025-01-01T00:00:00.000Z')).toBe(true);
  });

  test('returns true for null/undefined/empty (optional field)', () => {
    expect(validateDate(null)).toBe(true);
    expect(validateDate(undefined)).toBe(true);
    expect(validateDate('')).toBe(true);
  });

  test('returns false for invalid date strings', () => {
    expect(validateDate('not-a-date')).toBe(false);
    expect(validateDate('2025-13-99')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// 2. API route tests with supertest (mock mongoose/models/auth)
// ─────────────────────────────────────────────────────────────
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(true),
    connection: { readyState: 1, close: jest.fn() },
    Types: actual.Types,
  };
});

// Mock Auth Middleware
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { _id: '64abc123def456789012mock', username: 'testuser', email: 'test@example.com' };
    next();
  },
  JWT_SECRET: 'mock_secret_key_for_testing_purposes',
}));

// Mock User model
jest.mock('../src/models/User', () => {
  const mockFindOne = jest.fn();
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();

  function MockUser(data) {
    Object.assign(this, data);
  }
  MockUser.findOne = mockFindOne;
  MockUser.create = mockCreate;
  MockUser.findById = () => ({
    select: () => mockFindById(),
  });

  MockUser._mockFindOne = mockFindOne;
  MockUser._mockCreate = mockCreate;
  MockUser._mockFindById = mockFindById;

  return MockUser;
});

// Mock the Expense model
jest.mock('../src/models/Expense', () => {
  const mockSave   = jest.fn();
  const mockFind   = jest.fn();
  const mockFindOne = jest.fn();
  const mockCreate = jest.fn();
  const mockCountDocuments = jest.fn().mockResolvedValue(0);
  const mockFindOneAndUpdate = jest.fn();
  const mockFindOneAndDelete = jest.fn();
  const mockAggregate = jest.fn().mockResolvedValue([]);

  function MockExpense(data) {
    Object.assign(this, data);
    this.save = mockSave;
  }
  MockExpense.find = () => ({
    sort: () => ({ skip: () => ({ limit: mockFind }) }),
  });
  MockExpense.findOne = mockFindOne;
  MockExpense.create   = mockCreate;
  MockExpense.countDocuments = mockCountDocuments;
  MockExpense.findOneAndUpdate = mockFindOneAndUpdate;
  MockExpense.findOneAndDelete = mockFindOneAndDelete;
  MockExpense.aggregate = mockAggregate;

  MockExpense._mockFind   = mockFind;
  MockExpense._mockCreate = mockCreate;
  MockExpense._mockFindOne = mockFindOne;
  MockExpense._mockFindOneAndDelete = mockFindOneAndDelete;
  MockExpense._mockFindOneAndUpdate = mockFindOneAndUpdate;

  return MockExpense;
});

const request = require('supertest');
const app     = require('../src/index');
const Expense = require('../src/models/Expense');
const User    = require('../src/models/User');

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when username is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'a', email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'notanemail', password: 'password123' });
    expect(res.status).toBe(400);
  });

  test('returns 201 with token on valid registration', async () => {
    User._mockFindOne.mockResolvedValueOnce(null);
    User._mockCreate.mockResolvedValueOnce({
      _id: '64abc123def456789012user',
      username: 'testuser',
      email: 'test@example.com',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('testuser');
  });
});

describe('POST /api/expenses', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when amount is missing', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ description: 'Cà phê', category: 'Ăn uống', type: 'expense' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/số tiền/i);
  });

  test('returns 400 when amount is zero', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 0, description: 'Test', category: 'Ăn uống', type: 'expense' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when amount is negative', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: -50, description: 'Test', category: 'Ăn uống', type: 'expense' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 100, category: 'Ăn uống', type: 'expense' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/mô tả/i);
  });

  test('returns 400 when category is invalid', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 100, description: 'Test', category: 'InvalidCat', type: 'expense' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/danh mục/i);
  });

  test('returns 400 when type is invalid', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 100, description: 'Test', category: 'Ăn uống', type: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/loại giao dịch/i);
  });

  test('returns 201 with expense object on valid input (expense)', async () => {
    const mockExpense = {
      _id: '64abc123def456',
      userId: '64abc123def456789012mock',
      type: 'expense',
      amount: 50000,
      description: 'Cà phê sáng',
      category: 'Ăn uống',
      date: new Date().toISOString(),
      note: '',
    };
    Expense._mockCreate.mockResolvedValueOnce(mockExpense);

    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 50000, description: 'Cà phê sáng', category: 'Ăn uống', type: 'expense' });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(50000);
    expect(res.body.type).toBe('expense');
  });

  test('returns 201 with income object on valid input (income)', async () => {
    const mockIncome = {
      _id: '64abc123def789',
      userId: '64abc123def456789012mock',
      type: 'income',
      amount: 15000000,
      description: 'Lương tháng',
      category: 'Lương',
      date: new Date().toISOString(),
      note: '',
    };
    Expense._mockCreate.mockResolvedValueOnce(mockIncome);

    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 15000000, description: 'Lương tháng', category: 'Lương', type: 'income' });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(15000000);
    expect(res.body.type).toBe('income');
  });
});

describe('DELETE /api/expenses/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 for invalid MongoDB ID', async () => {
    const res = await request(app).delete('/api/expenses/not-valid-id');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/id không hợp lệ/i);
  });

  test('returns 404 when expense does not exist', async () => {
    Expense._mockFindOneAndDelete.mockResolvedValueOnce(null);
    const res = await request(app).delete('/api/expenses/64abc123def456789012abcd');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
  });
});
