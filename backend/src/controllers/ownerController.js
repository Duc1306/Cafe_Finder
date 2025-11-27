const { sequelize } = require('../config/database');
const { Cafe, Review, Favorite, CafePhoto } = require('../models');
const { Op } = require('sequelize');

const ownerController = {
  /**
   * GET /api/owner/dashboard/overview?ownerId=1
   */
  getDashboardOverview: async (req, res, next) => {
    try {
      const ownerId = Number(req.query.ownerId);
      if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });

      // Count cafes
      const cafes_count = await Cafe.count({ where: { owner_id: ownerId } });

      // Count favorites
      const favorites_count = await Favorite.count({
        include: [{
          model: Cafe,
          as: 'cafe',
          where: { owner_id: ownerId },
          attributes: []
        }]
      });

      // Count reviews and avg rating
      const reviewStats = await Review.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('Review.id')), 'reviews_count'],
          [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('Review.rating')), 2), 'avg_rating']
        ],
        include: [{
          model: Cafe,
          as: 'cafe',
          where: { owner_id: ownerId },
          attributes: []
        }],
        raw: true
      });

      // Recent reviews
      const recentReviews = await Review.findAll({
        include: [{
          model: Cafe,
          as: 'cafe',
          where: { owner_id: ownerId },
          attributes: ['id', 'name']
        }],
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: ['id', 'cafe_id', 'rating', 'comment', 'created_at']
      });

      res.json({
        ownerId,
        totals: {
          cafes: cafes_count || 0,
          favorites: favorites_count || 0,
          reviews: Number(reviewStats?.reviews_count) || 0,
          avgRating: Number(reviewStats?.avg_rating) || 0
        },
        recentReviews: recentReviews.map(r => ({
          id: r.id,
          cafe_id: r.cafe_id,
          cafe_name: r.cafe?.name,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at
        }))
      });
    } catch (e) { next(e); }
  },

  /**
   * GET /api/owner/shops?ownerId=1&page=1&limit=8&keyword=&city=
   */
  getShops: async (req, res, next) => {
    try {
      const ownerId = Number(req.query.ownerId);
      if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });

      const page   = Math.max(1, Number(req.query.page)  || 1);
      const limit  = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
      const offset = (page - 1) * limit;

      const keyword = (req.query.keyword || '').trim();
      const city    = (req.query.city || '').trim();

      const where = { owner_id: ownerId };

      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { address_line: { [Op.like]: `%${keyword}%` } },
          { city: { [Op.like]: `%${keyword}%` } }
        ];
      }
      if (city) {
        where.city = city;
      }

      const { count, rows } = await Cafe.findAndCountAll({
        where,
        include: [
          {
            model: Favorite,
            as: 'favorites',
            attributes: []
          },
          {
            model: Review,
            as: 'reviews',
            attributes: []
          },
          {
            model: CafePhoto,
            as: 'photos',
            where: { is_cover: true },
            required: false,
            attributes: ['url']
          }
        ],
        attributes: [
          'id', 'name', 'address_line', 'city', 'status',
          'avg_price_min', 'avg_price_max', 'open_time', 'close_time',
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('favorites.id'))), 'favorites_count'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('reviews.id'))), 'reviews_count'],
          [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('reviews.rating')), 2), 'avg_rating']
        ],
        group: ['Cafe.id', 'photos.id'],
        order: [['updated_at', 'DESC']],
        limit,
        offset,
        subQuery: false
      });

      const data = rows.map(cafe => {
        const plain = cafe.get({ plain: true });
        return {
          ...plain,
          favorites_count: Number(plain.favorites_count) || 0,
          reviews_count: Number(plain.reviews_count) || 0,
          avg_rating: Number(plain.avg_rating) || 0,
          cover_url: cafe.photos?.[0]?.url || null
        };
      });

      res.json({ page, limit, total: count.length || 0, data });
    } catch (e) { next(e); }
  }
};

module.exports = ownerController;
