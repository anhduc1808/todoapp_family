import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:4000/api',
});

api.interceptors.request.use(async (config) => {
  // For simplicity we rely on token from AsyncStorage in screens directly if needed.
  return config;
});

export default api;
