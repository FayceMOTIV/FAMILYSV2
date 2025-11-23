import api from './api';

export const getProducts = async (category = null, search = null, skip = 0, limit = 50) => {
  const params = { skip, limit };
  if (category) params.category = category;
  if (search) params.search = search;
  
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProduct = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getFeaturedProducts = async (limit = 10) => {
  const response = await api.get('/featured', { params: { limit } });
  return response.data;
};

export const getPromos = async () => {
  const response = await api.get('/promos');
  return response.data;
};
