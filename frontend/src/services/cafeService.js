/**
 * Cafe Service
 * API calls for cafe search, details, reviews, and favorites
 */

import api from './api';

// ==================== CAFE APIs ====================

export const searchCafes = async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    const response = await api.get(`/user/cafes?${queryParams}`);
    return response.data;
};

export const getCafeDetail = async (cafeId) => {
    const response = await api.get(`/user/cafes/${cafeId}`);
    return response.data;
};

export const getCafeReviews = async (cafeId, page = 1, limit = 10) => {
    const response = await api.get(`/user/cafes/${cafeId}/reviews?page=${page}&limit=${limit}`);
    return response.data;
};

export const postReview = async (cafeId, reviewData) => {
    const response = await api.post(`/user/cafes/${cafeId}/reviews`, reviewData);
    return response.data;
};

export const getAreas = async () => {
    try {
        const response = await api.get('/user/cafes/areas');
        return response.data;
    } catch (error) {
        console.error("Error fetching areas:", error);
        return { success: false, data: [] };
    }
};

// ==================== FAVORITES APIs ====================

export const getFavorites = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/user/favorites?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('getFavorites error:', error);
        throw error;
    }
};

export const addFavorite = async (cafeId) => {
    const response = await api.post('/user/favorites/toggle', { cafeId });
    return response.data;
};

export const removeFavorite = async (cafeId) => {
    const response = await api.post('/user/favorites/toggle', { cafeId });
    return response.data;
};
