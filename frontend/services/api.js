// FlowBudget API Service
const API_BASE = '/';

const api = {
  // Get stored tokens
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  
  // Store tokens
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },
  
  // Clear tokens
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Refresh access token
  refreshAccessToken: async () => {
    const refreshToken = api.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    
    const res = await fetch(`${API_BASE}auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    
    api.setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  },

  // Authenticated fetch with auto-refresh
  authFetch: async (url, options = {}) => {
    let token = api.getAccessToken();
    
    const makeRequest = async (t) => {
      return fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${t}`,
          ...options.headers,
        },
      });
    };

    let res = await makeRequest(token);
    
    // If 401 with TOKEN_EXPIRED, try refresh
    if (res.status === 401) {
      const data = await res.clone().json();
      if (data.code === 'TOKEN_EXPIRED') {
        try {
          token = await api.refreshAccessToken();
          res = await makeRequest(token);
        } catch {
          api.clearTokens();
          window.router.navigate('login');
          throw new Error('Session expired. Please login again.');
        }
      }
    }
    
    return res;
  },

  // Auth endpoints
  auth: {
    register: async (name, email, password) => {
      const res = await fetch(`${API_BASE}auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      return res.json();
    },

    login: async (email, password) => {
      const res = await fetch(`${API_BASE}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    },

    logout: async () => {
      const refreshToken = api.getRefreshToken();
      await fetch(`${API_BASE}auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      api.clearTokens();
    },
  },

  // Transaction endpoints
  transactions: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await api.authFetch(`transactions${qs}`);
      return res.json();
    },

    getById: async (id) => {
      const res = await api.authFetch(`transactions/${id}`);
      return res.json();
    },

    create: async (data) => {
      const res = await api.authFetch('transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },

    update: async (id, data) => {
      const res = await api.authFetch(`transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.json();
    },

    delete: async (id) => {
      const res = await api.authFetch(`transactions/${id}`, { method: 'DELETE' });
      return res.json();
    },
  },

  // Overview endpoints
  overview: {
    getSummary: async () => {
      const res = await api.authFetch('overview/summary');
      return res.json();
    },

    getExpensesLast7Days: async () => {
      const res = await api.authFetch('overview/expenses-last-7-days');
      return res.json();
    },

    getBalanceHistory: async () => {
      const res = await api.authFetch('overview/balance-history');
      return res.json();
    },
  },
};
