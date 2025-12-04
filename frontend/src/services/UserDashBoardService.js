import api from './api';

export const getUserDashboard = async () => {
  const res = await api.get('/users/dashboard');
  return res.data.data;
};