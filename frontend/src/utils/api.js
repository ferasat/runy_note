import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  authToken = null;
  delete api.defaults.headers.common.Authorization;
}

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && authToken) {
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export function eitaaLogin(payload) {
  return api.post('/auth/eitaa-login', payload);
}

export function classicLogin(credentials) {
  return api.post('/auth/login', credentials);
}

export function classicRegister(payload) {
  return api.post('/auth/register', payload);
}

export function fetchNotes(params = {}) {
  return api.get('/notes', { params });
}

export function fetchNoteDetail(id, { reveal = false } = {}) {
  return api.get(`/notes/${id}`, { params: reveal ? { reveal } : {} });
}

export function createNote(payload) {
  return api.post('/notes', payload);
}

export function updateNote(id, payload) {
  return api.put(`/notes/${id}`, payload);
}

export function deleteNote(id) {
  return api.delete(`/notes/${id}`);
}

export function fetchTags() {
  return api.get('/tags');
}

export function createTag(payload) {
  return api.post('/tags', payload);
}

export default api;
