import api from './api';

/**
 * Admin Cafe Management API Service
 */

/**
 * Lấy danh sách tất cả quán
 * @param {Object} params - { page, limit, keyword, city, status }
 * @returns {Promise}
 */
export const getAllCafes = async (params = {}) => {
  try {
    const response = await api.get('/admin/cafes', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Lấy chi tiết quán
 * @param {number} cafeId
 * @returns {Promise}
 */
export const getCafeDetail = async (cafeId) => {
  try {
    const response = await api.get(`/admin/cafes/${cafeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Cập nhật thông tin quán
 * @param {number} cafeId
 * @param {Object} updateData
 * @returns {Promise}
 */
export const updateCafe = async (cafeId, updateData) => {
  try {
    const response = await api.put(`/admin/cafes/${cafeId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Lấy danh sách quán chờ duyệt
 * @param {Object} params - { page, limit, keyword }
 * @returns {Promise}
 */
export const getPendingRequests = async (params = {}) => {
  try {
    const response = await api.get('/admin/cafes/requests', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Lấy chi tiết yêu cầu duyệt quán
 * @param {number} requestId
 * @returns {Promise}
 */
export const getRequestDetail = async (requestId) => {
  try {
    const response = await api.get(`/admin/cafes/requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Duyệt yêu cầu mở quán
 * @param {number} requestId
 * @returns {Promise}
 */
export const approveRequest = async (requestId) => {
  try {
    const response = await api.put(`/admin/cafes/requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Từ chối yêu cầu mở quán
 * @param {number} requestId
 * @param {string} reason
 * @returns {Promise}
 */
export const rejectRequest = async (requestId, reason) => {
  try {
    const response = await api.put(`/admin/cafes/requests/${requestId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Xóa quán (soft delete)
 * @param {number} cafeId
 * @returns {Promise}
 */
export const deleteCafe = async (cafeId) => {
  try {
    const response = await api.delete(`/admin/cafes/${cafeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
