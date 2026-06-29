import api from './axios';

export const register = (data) => api.post('/users/register', data);
export const login = (data) => api.post('/users/login', data);
export const googleAuth = (credential) => api.post('/users/auth/google', { credential });
export const forgotPassword = (email) => api.post('/users/forgot-password', { email });
export const resetPassword = (token, password) => api.put(`/users/reset-password/${token}`, { password });
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);
