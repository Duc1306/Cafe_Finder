import api from './api';

const adminUserService = {

  getAllAccounts: async (params) => {
    const res = await api.get("/admin/users", { params });
    return res.data;
  },

  updateAccount: async (id, data) => {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },

  deleteAccount: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  toggleStatus: async (id, status) => {
    const res = await api.put(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  approveOwner: async (id) => {
    const res = await api.put(`/admin/users/${id}/approve`);
    return res.data;
  },
};

export default adminUserService;
