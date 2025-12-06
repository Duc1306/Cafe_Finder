/**
 * Cafe Service
 * API calls for cafe search, details, reviews, and favorites
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthToken = () => sessionStorage.getItem('authToken') || localStorage.getItem('token');

const authHeaders = () => {
    const token = getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ==================== CAFE APIs ====================

export const searchCafes = async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    const response = await fetch(`${API_BASE_URL}/user/cafes?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch cafes');
    return response.json();
};

export const getCafeDetail = async (cafeId) => {
    const response = await fetch(`${API_BASE_URL}/user/cafes/${cafeId}`, {
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cafe details');
    return response.json();
};

export const getCafeReviews = async (cafeId, page = 1, limit = 10) => {
    const response = await fetch(
        `${API_BASE_URL}/user/cafes/${cafeId}/reviews?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
};

export const postReview = async (cafeId, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/user/cafes/${cafeId}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(reviewData),
    });
    if (!response.ok) throw new Error('Failed to post review');
    return response.json();
};

// ==================== FAVORITES APIs ====================

export const getFavorites = async (page = 1, limit = 10) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('認証が必要です。ログインしてください。');
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/user/favorites?page=${page}&limit=${limit}`,
            {
                headers: authHeaders(),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch favorites (${response.status})`);
        }

        return response.json();
    } catch (error) {
        console.error('getFavorites error:', error);
        throw error;
    }
};

export const addFavorite = async (cafeId) => {
    const response = await fetch(`${API_BASE_URL}/user/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ cafeId }),
    });
    if (!response.ok) throw new Error('Failed to add favorite');
    return response.json();
};

export const removeFavorite = async (cafeId) => {
    const response = await fetch(`${API_BASE_URL}/user/favorites/${cafeId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove favorite');
    return response.json();
};
