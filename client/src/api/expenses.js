/**
 * API client — thin wrapper around fetch with error handling.
 * All functions throw an Error with a Vietnamese message on failure.
 */

const BASE = '/api';

function getHeaders(custom = {}) {
  const token = localStorage.getItem('spendwise_token');
  const headers = { ...custom };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Lỗi ${res.status}: ${res.statusText}`);
  }
  return data;
}

// GET /api/expenses?month=YYYY-MM&category=...&type=...&page=1
export async function fetchExpenses({ month, category, type, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (month)    params.set('month', month);
  if (category) params.set('category', category);
  if (type)     params.set('type', type);
  const res = await fetch(`${BASE}/expenses?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// GET /api/expenses/stats?month=YYYY-MM&type=...
export async function fetchStats({ month, type } = {}) {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (type)  params.set('type', type);
  const res = await fetch(`${BASE}/expenses/stats?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// GET /api/expenses/:id
export async function fetchExpenseById(id) {
  const res = await fetch(`${BASE}/expenses/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// POST /api/expenses
export async function createExpense(data) {
  const res = await fetch(`${BASE}/expenses`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// PUT /api/expenses/:id
export async function updateExpense(id, data) {
  const res = await fetch(`${BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// DELETE /api/expenses/:id
export async function deleteExpense(id) {
  const res = await fetch(`${BASE}/expenses/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}
