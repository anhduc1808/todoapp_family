import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE || 'https://family-todoapp-backend-production.up.railway.app/api',
});

api.interceptors.request.use(async (config) => {
  // For simplicity we rely on token from AsyncStorage in screens directly if needed.
  return config;
});

export default api;
