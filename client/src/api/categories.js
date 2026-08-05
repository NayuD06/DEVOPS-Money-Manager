const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
const BASE = `${API_URL}/api`;

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

// Lấy danh sách custom categories
export async function fetchCategories() {
  const res = await fetch(`${BASE}/categories`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// Thêm category mới
export async function createCategory(data) {
  const res = await fetch(`${BASE}/categories`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Xóa category theo ID
export async function deleteCategory(id) {
  const res = await fetch(`${BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}
