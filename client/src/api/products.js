import api from './axios';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);

// Product create/update take multipart/form-data (images) — caller builds
// the FormData (text fields + up to 6 'images' files), this just sets the
// right header so axios doesn't default to application/json.
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
