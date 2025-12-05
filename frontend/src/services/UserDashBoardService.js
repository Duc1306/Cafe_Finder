import api from './api';

// Dashboard (giữ nguyên)
export const getUserDashboard = async () => {
  const res = await api.get('/users/dashboard');
  return res.data.data;
};

// Lấy profile user
export const getUserProfile = async () => {
  const res = await api.get('/users/profile');
  return res.data.data;
};

// Cập nhật profile user
export const updateUserProfile = async (data) => {
  const res = await api.put('/users/profile', data);
  return res.data.data;
};

export const uploadUserAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await api.post("/users/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.avatar_url;
};