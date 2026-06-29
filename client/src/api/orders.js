import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/mine');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getAllOrders = (params) => api.get('/orders', { params });
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);
export const hideOrder = (id) => api.put(`/orders/${id}/hide`);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
