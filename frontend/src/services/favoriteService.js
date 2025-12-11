// src/services/favoriteService.js
import api from './api';

const favoriteService = {
    /**
     * Lấy danh sách yêu thích
     * GET /api/favorites?page=1&limit=10&keyword=...&sort=...
     */
    getFavorites: async (params) => {
        try {
            const response = await api.get('/user/favorites', { params });
            return response.data; // { success: true, data: [...], total: ... }
        } catch (error) {
            console.error("Error fetching favorites:", error);
            throw error;
        }
    },

    /**
     * Toggle yêu thích (Thêm/Xóa)
     * POST /api/favorites/toggle
     */
    toggleFavorite: async (cafeId) => {
        try {
            const response = await api.post('/user/favorites/toggle', { cafeId });
            return response.data; // { success: true, status: 'added'/'removed' }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            throw error;
        }
    }
};

export default favoriteService;