import api from './axios';

// Nested under products on the backend (POST/GET /api/products/:productId/reviews) —
// deletion is standalone (DELETE /api/reviews/:id), matching reviewRoutes.js.
export const getReviews = (productId, params) => api.get(`/products/${productId}/reviews`, { params });
export const addReview = (productId, data) => api.post(`/products/${productId}/reviews`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
