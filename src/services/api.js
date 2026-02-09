// API Configuration and Client
const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

// Token storage (use expo-secure-store in production)
let accessToken = null;
let refreshToken = null;

export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  console.log('Tokens set:', { hasAccess: !!access, hasRefresh: !!refresh });
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const getAccessToken = () => {
  console.log('getAccessToken called, token exists:', !!accessToken);
  return accessToken;
};

// API Request helper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle token expiry
    if (response.status === 401 && data.error?.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        return apiRequest(endpoint, options);
      }
    }

    if (!response.ok) {
      throw new ApiError(data.error?.message || 'Request failed', data.error?.code, response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error. Please check your connection.', 'NETWORK_ERROR', 0);
  }
}

// Custom error class
export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// Refresh token
async function refreshAccessToken() {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ==========================================
// AUTH API
// ==========================================

export const authAPI = {
  signup: async (email, password, name) => {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (response.success) {
      setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    }
    return response;
  },

  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.success) {
      setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    }
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  me: () => apiRequest('/auth/me'),
};

// ==========================================
// USER API
// ==========================================

export const userAPI = {
  getProfile: () => apiRequest('/users/me'),
  
  updateProfile: (data) => apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  changePassword: (currentPassword, newPassword) => apiRequest('/users/me/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),

  getConnectedAccounts: () => apiRequest('/users/me/connected-accounts'),

  disconnectAccount: (accountId) => apiRequest(`/users/me/connected-accounts/${accountId}`, {
    method: 'DELETE',
  }),

  getStats: () => apiRequest('/users/me/stats'),

  deleteAccount: () => apiRequest('/users/me', { method: 'DELETE' }),
};

// ==========================================
// AGENTS API
// ==========================================

export const agentsAPI = {
  getTypes: () => apiRequest('/agents/types'),

  getAll: () => apiRequest('/agents'),

  getOne: (id) => apiRequest(`/agents/${id}`),

  create: (data) => apiRequest('/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/agents/${id}`, { method: 'DELETE' }),

  pause: (id) => apiRequest(`/agents/${id}/pause`, { method: 'POST' }),

  resume: (id) => apiRequest(`/agents/${id}/resume`, { method: 'POST' }),

  activate: (id) => apiRequest(`/agents/${id}/activate`, { method: 'POST' }),

  getActivity: (id, page = 1, limit = 20) => 
    apiRequest(`/agents/${id}/activity?page=${page}&limit=${limit}`),
};

// ==========================================
// ACTIVITY API
// ==========================================

export const activityAPI = {
  getAll: (page = 1, limit = 20, agentId = null) => {
    let url = `/activity?page=${page}&limit=${limit}`;
    if (agentId) url += `&agentId=${agentId}`;
    return apiRequest(url);
  },

  getTodaySummary: () => apiRequest('/activity/today'),
};

// ==========================================
// PENDING ACTIONS API
// ==========================================

export const pendingActionsAPI = {
  getAll: () => apiRequest('/pending-actions'),

  approve: (id, modifications = null) => apiRequest(`/pending-actions/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ modifications }),
  }),

  reject: (id) => apiRequest(`/pending-actions/${id}/reject`, { method: 'POST' }),
};

// ==========================================
// NOTIFICATIONS API
// ==========================================

export const notificationsAPI = {
  getAll: (page = 1, limit = 20, unreadOnly = false) => 
    apiRequest(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`),

  markAsRead: (ids) => apiRequest('/notifications/mark-read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  }),

  markAllAsRead: () => apiRequest('/notifications/mark-all-read', { method: 'POST' }),

  delete: (id) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),
};

// ==========================================
// WATCHLIST (PRICE WATCHDOG) API
// ==========================================

export const watchlistAPI = {
  scrapeUrl: (url) => apiRequest('/watchlist/scrape', {
    method: 'POST',
    body: JSON.stringify({ url }),
  }),

  getAll: () => apiRequest('/watchlist'),

  add: (url, name, targetPrice = null, currentPrice = 0, imageUrl = null) => apiRequest('/watchlist', {
    method: 'POST',
    body: JSON.stringify({ name, url, originalPrice: currentPrice, currentPrice, targetPrice, imageUrl }),
  }),

  getOne: (id) => apiRequest(`/watchlist/${id}`),

  remove: (id) => apiRequest(`/watchlist/${id}`, { method: 'DELETE' }),

  checkPrices: (id) => {
    if (id) return apiRequest(`/watchlist/${id}/check-price`, { method: 'POST' });
    return apiRequest('/watchlist').then(res => {
      if (res.success && res.data?.items?.length) {
        return Promise.all(res.data.items.map(item => apiRequest(`/watchlist/${item.id}/check-price`, { method: 'POST' }).catch(() => null)));
      }
      return [];
    });
  },

  getAlerts: () => apiRequest('/watchlist/alerts'),

  markAlertsRead: (ids) => apiRequest('/watchlist/alerts/mark-read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  }),

  getStats: () => apiRequest('/watchlist/stats'),
};

// ==========================================
// HEALTH CHECK
// ==========================================

export const healthCheck = () => apiRequest('/health');

export default {
  auth: authAPI,
  user: userAPI,
  agents: agentsAPI,
  activity: activityAPI,
  pendingActions: pendingActionsAPI,
  notifications: notificationsAPI,
  watchlist: watchlistAPI,
  healthCheck,
};
