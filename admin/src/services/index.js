import api from './api';

export const authApi = {
  login: (data) => api.post('/auth/admin/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  // Products
  products: (params) => api.get('/admin/products', { params }),
  product: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  deleteProductImage: (id, imageId) => api.delete(`/admin/products/${id}/images/${imageId}`),
  reorderImages: (id, imageIds) => api.put(`/admin/products/${id}/images/reorder`, { imageIds }),
  // Categories
  categories: (params) => api.get('/admin/categories', { params }),
  categoryTree: () => api.get('/admin/categories/tree'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  // Brands
  brands: (params) => api.get('/admin/brands', { params }),
  createBrand: (data) => api.post('/admin/brands', data),
  updateBrand: (id, data) => api.put(`/admin/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/admin/brands/${id}`),
  // Orders
  orders: (params) => api.get('/admin/orders', { params }),
  order: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  invoice: (id) => api.get(`/admin/orders/${id}/invoice`),
  // Users
  users: (params) => api.get('/admin/users', { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
  // Coupons
  coupons: (params) => api.get('/admin/coupons', { params }),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  // Banners
  banners: (params) => api.get('/admin/banners', { params }),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  toggleBanner: (id) => api.put(`/admin/banners/${id}/toggle`),
  // Reviews
  reviews: (params) => api.get('/admin/reviews', { params }),
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`),
  rejectReview: (id) => api.put(`/admin/reviews/${id}/reject`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  // Settings
  settings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};
