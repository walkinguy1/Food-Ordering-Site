import api from './api';

export const orderService = {
  // Place order
  async createOrder(orderData) {
    const response = await api.post('/api/v1/orders', orderData);
    return response.data;
  },

  // Get user's orders
  async getMyOrders() {
    const response = await api.get('/api/v1/orders/my-orders');
    return response.data;
  },

  // Get single order
  async getOrder(orderId) {
    const response = await api.get(`/api/v1/orders/${orderId}`);
    return response.data;
  }
};