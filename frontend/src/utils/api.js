// API Helper utility for network requests
const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      return data;
    } catch (error) {
      console.error(`API GET error on ${endpoint}:`, error);
      throw error;
    }
  },

  post: async (endpoint, body) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      return data;
    } catch (error) {
      console.error(`API POST error on ${endpoint}:`, error);
      throw error;
    }
  },

  put: async (endpoint, body) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      return data;
    } catch (error) {
      console.error(`API PUT error on ${endpoint}:`, error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      return data;
    } catch (error) {
      console.error(`API DELETE error on ${endpoint}:`, error);
      throw error;
    }
  }
};
