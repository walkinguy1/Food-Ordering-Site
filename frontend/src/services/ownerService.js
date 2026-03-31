import api from './api';

export const ownerService = {
  // Dashboard Stats
  async getDashboardStats() {
    const response = await api.get('/api/v1/owner/dashboard/stats');
    return response.data;
  },

  // Restaurant Management
  async getMyRestaurant() {
    const response = await api.get('/api/v1/owner/restaurant');
    return response.data;
  },

  async updateRestaurant(restaurantData) {
    const response = await api.put('/api/v1/owner/restaurant', restaurantData);
    return response.data;
  },

  // Menu Management
  async getMyMenu() {
    const response = await api.get('/api/v1/owner/menu');
    return response.data;
  },

  async createMenuItem(menuItemData) {
    const response = await api.post('/api/v1/owner/menu', menuItemData);
    return response.data;
  },

  async updateMenuItem(id, menuItemData) {
    const response = await api.put(`/api/v1/owner/menu/${id}`, menuItemData);
    return response.data;
  },

  async deleteMenuItem(id) {
    const response = await api.delete(`/api/v1/owner/menu/${id}`);
    return response.data;
  },

  // Order Management
  async getMyOrders() {
    const response = await api.get('/api/v1/owner/orders');
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/api/v1/owner/orders/${orderId}/status`, { status });
    return response.data;
  }
};