/**
 * Favorite Controller
 * Handles favorite-related requests
 */
const favoriteService = require('../services/favoriteService');

const ERROR_MESSAGES = {
    SERVER_ERROR: 'サーバーエラーが発生しました。',
    CAFE_NOT_FOUND: 'カフェが見つかりません。',
    CAFE_ID_REQUIRED: 'cafeId is required.',
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error(`${fn.name} error:`, error);
        res.status(500).json({ error: ERROR_MESSAGES.SERVER_ERROR });
    });
};

const favoriteController = {
    /**
     * GET /api/user/favorites - Lấy danh sách quán yêu thích
     */
    getUserFavorites: asyncHandler(async (req, res) => {
        const { id: userId } = req.user;
        const { page, limit } = req.query;
        const result = await favoriteService.getUserFavorites({ userId, page, limit });
        res.json(result);
    }),

    /**
     * POST /api/user/favorites - Thêm quán vào yêu thích
     */
    addFavorite: asyncHandler(async (req, res) => {
        const { id: userId } = req.user;
        const { cafeId } = req.body;

        if (!cafeId) {
            return res.status(400).json({ error: ERROR_MESSAGES.CAFE_ID_REQUIRED });
        }

        const result = await favoriteService.addFavorite({ cafeId, userId });

        if (result.notFound) {
            return res.status(404).json({ error: ERROR_MESSAGES.CAFE_NOT_FOUND });
        }
        res.json(result);
    }),

    /**
     * DELETE /api/user/favorites/:cafeId - Xóa quán khỏi yêu thích
     */
    removeFavorite: asyncHandler(async (req, res) => {
        const { id: userId } = req.user;
        const { cafeId } = req.params;
        const result = await favoriteService.removeFavorite({ cafeId, userId });
        res.json(result);
    }),
};

module.exports = favoriteController;
