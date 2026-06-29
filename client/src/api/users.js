import api from './axios';

export const register = (data) => api.post('/users/register', data);
export const login = (data) => api.post('/users/login', data);
export const googleAuth = (credential) => api.post('/users/auth/google', { credential });
export const forgotPassword = (email) => api.post('/users/forgot-password', { email });
export const resetPassword = (token, password) => api.put(`/users/reset-password/${token}`, { password });
export const getMe = () => api.get('/users/me');
// FormData so an avatar file can travel in the same request as the rest
// of the profile fields — see userController.updateMe.
export const updateMe = (formData) =>
  api.put('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
