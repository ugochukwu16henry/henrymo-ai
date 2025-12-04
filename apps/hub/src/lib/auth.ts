// src/lib/auth.ts
import api from './api';

export async function register(data: {
  email: string;
  password: string;
  name: string;
}) {
  const resp = await api.post('/api/auth/register', data);
  const { token, user } = resp.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token, user };
}

export async function login(data: { email: string; password: string }) {
  const resp = await api.post('/api/auth/login', data);
  const { token, user } = resp.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token, user };
}

export async function getCurrentUser() {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  return userStr ? JSON.parse(userStr) : null;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}
