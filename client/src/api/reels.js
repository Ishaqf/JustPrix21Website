import api from './axios';

export const getReels = () => api.get('/reels');
export const getReel = (id) => api.get(`/reels/${id}`);
export const createReel = (data) => api.post('/reels', data);
export const updateReel = (id, data) => api.put(`/reels/${id}`, data);
export const deleteReel = (id) => api.delete(`/reels/${id}`);
