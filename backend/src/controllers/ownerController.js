const ownerService = require('../services/ownerService');
const { sequelize } = require('../config/database');
const { Cafe, Review, Favorite, CafePhoto } = require('../models');
const { Op } = require('sequelize');

const ownerController = {

  /**
   * ============================================
   * GET /api/owner/dashboard/overview
   * ============================================
   */
  getDashboardOverview: async (req, res, next) => {
    try {
      const ownerId = req.user.id;

      // Count cafes
      const cafes_count = await Cafe.count({
        where: { owner_id: ownerId }
      });

      // Count favorites (join café)
      const favorites_count = await Favorite.count({
        include: [
          {
            model: Cafe,
            as: "cafe",
            where: { owner_id: ownerId }
          }
        ]
      });

      // Reviews statistics
      const reviewStats = await Review.findOne({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("Review.id")), "rev_count"],
          [sequelize.fn("ROUND", sequelize.fn("AVG", sequelize.col("rating")), 2), "avg_rating"]
        ],
        include: [
          {
            model: Cafe,
            as: "cafe",
            attributes: [],
            where: { owner_id: ownerId }
          }
        ],
        raw: true
      });

      const reviews_count = Number(reviewStats?.rev_count || 0);
      const avgRating = Number(reviewStats?.avg_rating || 0);

      // Recent reviews
      const recentReviews = await Review.findAll({
        attributes: ["id", "cafe_id", "rating", "comment", "created_at"],
        include: [
          {
            model: Cafe,
            as: "cafe",
            attributes: ["name"],
            where: { owner_id: ownerId }
          }
        ],
        order: [["created_at", "DESC"]],
        limit: 5
      });

      res.json({
        ownerId,
        totals: {
          cafes: cafes_count,
          favorites: favorites_count,
          reviews: reviews_count,
          avgRating
        },
        recentReviews
      });

    } catch (e) { next(e); }
  },

  /**
   * ============================================
   * GET /api/owner/shops
   * Pagination + Search + Stats
   * ============================================
   */
  getShops: async (req, res, next) => {
    try {
      const ownerId = req.user.id;

      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        keyword: req.query.keyword,
        city: req.query.city
      };

      const result = await ownerService.getOwnerCafes(ownerId, filters);

      res.json({
        success: true,
        page: result.page,
        limit: result.limit,
        total: result.total,
        data: result.data
      });

    } catch (e) { next(e); }
  }

};

module.exports = ownerController;
