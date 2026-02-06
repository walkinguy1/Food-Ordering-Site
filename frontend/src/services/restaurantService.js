import api from './api';

export const restaurantService = {
  // Get all restaurants
  async getRestaurants() {
    const response = await api.get('/api/v1/restaurants');
    return response.data;
  },

  // Get single restaurant with menu
  async getRestaurant(id) {
    const response = await api.get(`/api/v1/restaurants/${id}`);
    return response.data;
  },

  // Get menu for a restaurant
  async getMenu(restaurantId) {
    const response = await api.get(`/api/v1/restaurants/${restaurantId}/menu`);
    return response.data;
  }
};