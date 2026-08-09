import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zaiqa_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalizes backend { error: { message } } shape into a plain Error with
// .message so components can just do err.message.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error?.message || err.message || 'Something went wrong';
    const details = err.response?.data?.error?.details;
    const normalized = new Error(message);
    normalized.status = err.response?.status;
    normalized.details = details;
    return Promise.reject(normalized);
  }
);

export default api;
