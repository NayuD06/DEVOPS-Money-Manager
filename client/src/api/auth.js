/**
 * Auth API client — thin wrapper around fetch with error handling.
 */

const BASE = '/api/auth';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Lỗi ${res.status}: ${res.statusText}`);
  }
  return data;
}

export async function register(username, email, password) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function fetchCurrentUser() {
  const token = localStorage.getItem('spendwise_token');
  if (!token) return null;
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    localStorage.removeItem('spendwise_token');
    return null;
  }
  const data = await res.json();
  return data.user;
}
