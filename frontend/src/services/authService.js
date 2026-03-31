import api from './api';

export const authService = {
  async register(userData) {
    // Frontend register form uses full_name/phone; auth service expects name/phoneNumber.
    const payload = {
      name: userData.full_name || userData.name,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phone || userData.phoneNumber,
      role: userData.role || 'customer'
    };

    const response = await api.post('/api/v1/auth/register', payload);
    return response.data;
  },

  async login(email, password) {
    const payload = { email, password };
    
    const response = await api.post('/api/v1/auth/login', payload);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Store user info
      localStorage.setItem('user', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      }));
    }
    
    return response.data;
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/v1/auth/me');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};