const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (res.status === 204) {
      return null;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.message || data.error || (data.details && data.details.join(', ')) || `HTTP ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Books
  getBooks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.genre && params.genre !== 'ALL') query.append('genre', params.genre);
    if (params.availableOnly) query.append('availableOnly', 'true');
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    const qs = query.toString();
    return request(`/books${qs ? `?${qs}` : ''}`);
  },
  getBookById: (id) => request(`/books/${id}`),
  getGenres: () => request('/books/genres'),
  createBook: (data) => request('/books', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id, data) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  // Members
  getMembers: (search = '') => request(`/members${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getMemberById: (id) => request(`/members/${id}`),
  getMemberHistory: (id) => request(`/members/${id}/history`),
  registerMember: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),

  // Inventory
  adjustStock: (data) => request('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
  getInventoryTransactions: (bookId = null) =>
    request(`/inventory/transactions${bookId ? `?bookId=${bookId}` : ''}`),

  // Issues & Returns
  issueBook: (data) => request('/issues', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (recordId, notes = '') =>
    request(`/returns/${recordId}`, { method: 'POST', body: JSON.stringify({ notes }) }),
  getBorrowings: (status = '', memberId = null) => {
    const query = new URLSearchParams();
    if (status && status !== 'ALL') query.append('status', status);
    if (memberId) query.append('memberId', memberId);
    const qs = query.toString();
    return request(`/issues${qs ? `?${qs}` : ''}`);
  },
};
