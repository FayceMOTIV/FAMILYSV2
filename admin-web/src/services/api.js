import axios from 'axios'

const API_BASE_URL = 'https://react-reborn.preview.emergentagent.com/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient

// API Services
export const authAPI = {
  login: (credentials) => apiClient.post('/admin/auth/login', credentials),
  logout: () => apiClient.post('/admin/auth/logout')
}

export const dashboardAPI = {
  getStats: () => apiClient.get('/admin/dashboard/stats')
}

export const productsAPI = {
  getAll: (params) => apiClient.get('/admin/products', { params }),
  getById: (id) => apiClient.get(`/admin/products/${id}`),
  create: (data) => apiClient.post('/admin/products', data),
  update: (id, data) => apiClient.put(`/admin/products/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/products/${id}`)
}

export const categoriesAPI = {
  getAll: () => apiClient.get('/admin/categories'),
  getById: (id) => apiClient.get(`/admin/categories/${id}`),
  create: (data) => apiClient.post('/admin/categories', data),
  update: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/categories/${id}`)
}

export const ordersAPI = {
  getAll: (params) => apiClient.get('/admin/orders', { params }),
  getById: (id) => apiClient.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/admin/orders/${id}/status`, { status }),
  recordPayment: (id, paymentData) => apiClient.post(`/admin/orders/${id}/payment`, paymentData)
}

export const customersAPI = {
  getAll: (params) => apiClient.get('/admin/customers', { params }),
  getById: (id) => apiClient.get(`/admin/customers/${id}`)
}

export const promotionsAPI = {
  getAll: (params) => apiClient.get('/admin/promotions', { params }),
  getById: (id) => apiClient.get(`/admin/promotions/${id}`),
  create: (data) => apiClient.post('/admin/promotions', data),
  update: (id, data) => apiClient.put(`/admin/promotions/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/promotions/${id}`),
  simulate: (data) => apiClient.post('/admin/promotions/simulate', data),
  getAnalytics: () => apiClient.get('/admin/promotions/analytics/overview')
}

export const aiMarketingAPI = {
  getCampaigns: (status) => apiClient.get(`/admin/ai-marketing/campaigns/all`, { params: { status } }),
  validateCampaign: (id) => apiClient.post(`/admin/ai-marketing/campaigns/${id}/validate`),
  generateCampaigns: () => apiClient.post('/admin/ai-marketing/campaigns/generate'),
  getStats: () => apiClient.get('/admin/ai-marketing/stats')
}
