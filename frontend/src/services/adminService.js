import api from './api';

export const adminService = {
  // Dashboard Stats
  async getDashboardStats() {
    const response = await api.get('/api/v1/admin/dashboard/stats');
    return response.data;
  },

  // Restaurant Management
  async createRestaurant(restaurantData) {
    const response = await api.post('/api/v1/admin/restaurants', restaurantData);
    return response.data;
  },

  async updateRestaurant(id, restaurantData) {
    const response = await api.put(`/api/v1/admin/restaurants/${id}`, restaurantData);
    return response.data;
  },

  async deleteRestaurant(id) {
    const response = await api.delete(`/api/v1/admin/restaurants/${id}`);
    return response.data;
  },

  // Menu Item Management
  async createMenuItem(menuItemData) {
    const response = await api.post('/api/v1/admin/menu-items', menuItemData);
    return response.data;
  },

  async updateMenuItem(id, menuItemData) {
    const response = await api.put(`/api/v1/admin/menu-items/${id}`, menuItemData);
    return response.data;
  },

  async deleteMenuItem(id) {
    const response = await api.delete(`/api/v1/admin/menu-items/${id}`);
    return response.data;
  },

  // Order Management
  async getAllOrders() {
    const response = await api.get('/api/v1/admin/orders');
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/api/v1/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  // User Management
  async getAllUsers() {
    const response = await api.get('/api/v1/admin/users');
    return response.data;
  }
};