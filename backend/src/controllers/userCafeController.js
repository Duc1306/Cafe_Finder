/**
 * User Cafe Controller
 * Handles cafe-related requests for customer users
 */
const userCafeService = require('../services/userCafeService');

// Error messages
const ERROR_MESSAGES = {
    SERVER_ERROR: 'サーバーエラーが発生しました。',
    CAFE_NOT_FOUND: 'カフェが見つかりません。',
    CAFE_ID_REQUIRED: 'cafeId is required.',
    RATING_REQUIRED: 'Rating is required.',
    INVALID_RATING: 'Rating must be between 1 and 5.',
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error(`${fn.name} error:`, error);
        res.status(500).json({ error: ERROR_MESSAGES.SERVER_ERROR });
    });
};

const userCafeController = {
    /**
     * GET /api/user/cafes - Lấy danh sách quán cafe
     */
    getCafeList: asyncHandler(async (req, res) => {
        const result = await userCafeService.getCafeList(req.query);
        res.json(result);
    }),

    /**
     * GET /api/user/cafes/:id - Lấy chi tiết quán cafe
     */
    getCafeDetail: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const currentUserId = req.user?.id || null;
        const result = await userCafeService.getCafeDetail(id, currentUserId);

        if (!result) {
            return res.status(404).json({ error: ERROR_MESSAGES.CAFE_NOT_FOUND });
        }
        res.json(result);
    }),

    /**
     * GET /api/user/cafes/:id/reviews - Lấy danh sách reviews
     */
    getCafeReviews: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await userCafeService.getCafeReviews(id, req.query);
        res.json(result);
    }),

    /**
     * GET /api/user/favorites - Lấy danh sách quán yêu thích
     */
    getUserFavorites: asyncHandler(async (req, res) => {
        const { id: userId } = req.user;
        const { page, limit } = req.query;
        const result = await userCafeService.getUserFavorites({ userId, page, limit });
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

        const result = await userCafeService.addFavorite({ cafeId, userId });

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
        const result = await userCafeService.removeFavorite({ cafeId, userId });
        res.json(result);
    }),

    /**
     * POST /api/user/cafes/:id/reviews - Đăng review mới
     */
    createReview: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id: cafeId } = req.params;
        const { rating, comment, imageUrl } = req.body;

        if (!rating) {
            return res.status(400).json({ error: ERROR_MESSAGES.RATING_REQUIRED });
        }

        const result = await userCafeService.createReview({
            cafeId,
            userId,
            rating,
            comment,
            imageUrl,
        });

        if (result.notFound) {
            return res.status(404).json({ error: ERROR_MESSAGES.CAFE_NOT_FOUND });
        }
        if (result.invalidRating) {
            return res.status(400).json({ error: ERROR_MESSAGES.INVALID_RATING });
        }

        res.status(result.isUpdated ? 200 : 201).json(result);
    }),
};

module.exports = userCafeController;
