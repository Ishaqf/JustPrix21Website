import api from './axios';

// Lives under /api/users/wishlist on the backend (scoped to req.user, no
// userId ever passed) — see userRoutes.js.
export const getWishlist = () => api.get('/users/wishlist');
export const addToWishlist = (productId) => api.post(`/users/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/users/wishlist/${productId}`);
export const clearWishlist = () => api.delete('/users/wishlist');
