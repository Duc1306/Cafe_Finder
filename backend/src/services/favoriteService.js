/**
 * Favorite Service
 * Business logic for user favorites
 */
const db = require('../models');
const { Cafe, Review, Favorite, CafePhoto } = db;
const { Op, fn, col } = require('sequelize');

/**
 * Helper functions
 */
const rowsToMap = (rows, keyField, mapper) => {
    const map = {};
    rows.forEach((row) => {
        const plain = row.get({ plain: true });
        map[plain[keyField]] = mapper(plain);
    });
    return map;
};

const getRatingStats = async (cafeIds) => {
    const rows = await Review.findAll({
        where: { cafe_id: { [Op.in]: cafeIds } },
        attributes: [
            'cafe_id',
            [fn('COUNT', col('id')), 'reviewsCount'],
            [fn('COALESCE', fn('AVG', col('rating')), 0), 'rating'],
        ],
        group: ['cafe_id'],
    });
    return rowsToMap(rows, 'cafe_id', (p) => ({
        reviewsCount: Number(p.reviewsCount || 0),
        rating: Number(p.rating || 0),
    }));
};

const getFavoritesCount = async (cafeIds) => {
    const rows = await Favorite.findAll({
        where: { cafe_id: { [Op.in]: cafeIds } },
        attributes: [
            'cafe_id',
            [fn('COUNT', fn('DISTINCT', col('user_id'))), 'favoritesCount'],
        ],
        group: ['cafe_id'],
    });
    return rowsToMap(rows, 'cafe_id', (p) => ({
        favoritesCount: Number(p.favoritesCount || 0),
    }));
};

const getCoverPhotos = async (cafeIds) => {
    const rows = await CafePhoto.findAll({
        where: { cafe_id: { [Op.in]: cafeIds }, is_cover: true },
        attributes: ['cafe_id', 'url'],
    });
    return rowsToMap(rows, 'cafe_id', (p) => ({ url: p.url }));
};

const favoriteService = {
    /**
     * GET /favorites - Lấy danh sách quán yêu thích của user
     */
    getUserFavorites: async ({ userId, page = 1, limit = 10 }) => {
        const actualPage = Math.max(1, Number(page) || 1);
        const actualLimit = Math.min(50, Math.max(1, Number(limit) || 10));
        const offset = (actualPage - 1) * actualLimit;

        // 1. Đếm tổng
        const { count: total } = await Favorite.findAndCountAll({
            where: { user_id: userId },
            include: [
                {
                    model: Cafe,
                    as: 'cafe',
                    required: true,
                    where: { status: 'ACTIVE' },
                },
            ],
        });

        if (total === 0) {
            return {
                page: actualPage,
                limit: actualLimit,
                total: 0,
                data: [],
            };
        }

        // 2. Lấy page favorites + cafe
        const favs = await Favorite.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Cafe,
                    as: 'cafe',
                    required: true,
                    where: { status: 'ACTIVE' },
                    attributes: [
                        'id',
                        'name',
                        'address_line',
                        'district',
                        'city',
                        'avg_price_min',
                        'avg_price_max',
                        'open_time',
                        'close_time',
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
            limit: actualLimit,
            offset,
        });

        const cafeIds = favs.map((f) => f.cafe_id);
        if (cafeIds.length === 0) {
            return {
                page: actualPage,
                limit: actualLimit,
                total,
                data: [],
            };
        }

        // 3. Fetch stats in parallel
        const [ratingMap, favCountMap, coverMap] = await Promise.all([
            getRatingStats(cafeIds),
            getFavoritesCount(cafeIds),
            getCoverPhotos(cafeIds),
        ]);

        // 4. Build data
        const data = favs.map((fav) => {
            const f = fav.get({ plain: true });
            const c = f.cafe;

            const id = c.id;
            const rating = ratingMap[id]?.rating || 0;
            const favoritesCount = favCountMap[id]?.favoritesCount || 0;
            const coverUrl = coverMap[id]?.url || null;

            return {
                id,
                name: c.name,
                addressLine: c.address_line,
                district: c.district,
                city: c.city,
                avgPriceMin: c.avg_price_min,
                avgPriceMax: c.avg_price_max,
                rating,
                favoritesCount,
                coverUrl,
                openTime: c.open_time,
                closeTime: c.close_time,
                favoritedAt: f.created_at,
            };
        });

        return {
            page: actualPage,
            limit: actualLimit,
            total,
            data,
        };
    },

    /**
     * POST /favorites - Thêm quán vào yêu thích
     */
    addFavorite: async ({ cafeId, userId }) => {
        const cafe = await Cafe.findOne({
            where: { id: cafeId, status: 'ACTIVE' },
        });

        if (!cafe) {
            return { notFound: true };
        }

        await Favorite.findOrCreate({
            where: { cafe_id: cafeId, user_id: userId },
            defaults: { cafe_id: cafeId, user_id: userId },
        });

        const favoritesCount = await Favorite.count({
            where: { cafe_id: cafeId },
        });

        return {
            cafeId,
            favoritesCount,
            isFavorite: true,
        };
    },

    /**
     * DELETE /favorites/:cafeId - Xóa quán khỏi yêu thích
     */
    removeFavorite: async ({ cafeId, userId }) => {
        await Favorite.destroy({
            where: { cafe_id: cafeId, user_id: userId },
        });

        const favoritesCount = await Favorite.count({
            where: { cafe_id: cafeId },
        });

        return {
            cafeId,
            favoritesCount,
            isFavorite: false,
        };
    },
};

module.exports = favoriteService;
