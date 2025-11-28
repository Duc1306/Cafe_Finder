const { sequelize } = require('../config/database');
const { Cafe, Review, Favorite, CafePhoto } = require('../models');
const { Op } = require('sequelize');

const ownerService = {
  /**
   * Get dashboard overview statistics for owner
   */
  getDashboardStats: async (ownerId) => {
    // Count cafes
    const cafes_count = await Cafe.count({
      where: { owner_id: ownerId }
    });

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
        [sequelize.fn('COUNT', sequelize.col('Review.id')), 'rev_count'],
        [
          sequelize.fn(
            'ROUND',
            sequelize.fn(
              'AVG',
              sequelize.cast(sequelize.col('Review.rating'), 'numeric')
            ),
            2
          ),
          'avg_rating'
        ]
      ],
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: [],
        where: { owner_id: ownerId }
      }],
      raw: true
    });

    const reviews_count = Number(reviewStats?.rev_count || 0);
    const avgRating = Number(reviewStats?.avg_rating || 0);

    // Get recent reviews
    const recentReviews = await Review.findAll({
      attributes: ['id', 'cafe_id', 'rating', 'comment', 'created_at'],
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name'],
        where: { owner_id: ownerId }
      }],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    return {
      totals: {
        cafes: cafes_count || 0,
        favorites: favorites_count || 0,
        reviews: reviews_count || 0,
        avgRating: avgRating || 0
      },
      recentReviews
    };
  },

  /**
   * Get paginated list of cafes for owner with filters
   */
  getOwnerCafes: async (ownerId, filters) => {
    const { page = 1, limit = 10, keyword = '', city = '' } = filters;
    
    const actualPage = Math.max(1, Number(page));
    const actualLimit = Math.min(50, Math.max(1, Number(limit)));
    const offset = (actualPage - 1) * actualLimit;

    const where = { owner_id: ownerId };

    if (keyword && keyword.trim()) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${keyword.trim()}%` } },
        { address_line: { [Op.iLike]: `%${keyword.trim()}%` } },
        { city: { [Op.iLike]: `%${keyword.trim()}%` } }
      ];
    }

    if (city && city.trim()) {
      where.city = city.trim();
    }

    // Get count of total cafes
    const totalCafes = await Cafe.count({ where });

    // Get paginated cafes
    const cafes = await Cafe.findAll({
      attributes: [
        'id',
        'name',
        'address_line',
        'city',
        'status',
        'avg_price_min',
        'avg_price_max',
        'open_time',
        'close_time',
        'updated_at'
      ],
      where,
      order: [['updated_at', 'DESC']],
      limit: actualLimit,
      offset,
      raw: true
    });

    // Get all cafe IDs for batch query
    const cafeIds = cafes.map(c => c.id);

    // Fetch all aggregates in separate batch queries using Sequelize
    let aggregateMap = {};
    if (cafeIds.length > 0) {
      // favorites count per cafe
      const favResults = await Favorite.findAll({
        where: { cafe_id: cafeIds },
        attributes: [
          'cafe_id',
          [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']
        ],
        group: ['cafe_id'],
        raw: true
      });

      // reviews count + avg rating per cafe
      const revResults = await Review.findAll({
        where: { cafe_id: cafeIds },
        attributes: [
          'cafe_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.cast(sequelize.col('rating'), 'numeric')), 2), 'avg_rating']
        ],
        group: ['cafe_id'],
        raw: true
      });

      // cover photo per cafe (assuming at most one cover)
      const photoResults = await CafePhoto.findAll({
        where: { cafe_id: cafeIds, is_cover: true },
        attributes: ['cafe_id', 'url'],
        raw: true
      });

      // Build map for quick lookup
      favResults.forEach(f => {
        aggregateMap[f.cafe_id] = aggregateMap[f.cafe_id] || {};
        aggregateMap[f.cafe_id].favorites_count = Number(f.count || 0);
      });

      revResults.forEach(r => {
        aggregateMap[r.cafe_id] = aggregateMap[r.cafe_id] || {};
        aggregateMap[r.cafe_id].reviews_count = Number(r.count || 0);
        aggregateMap[r.cafe_id].avg_rating = Number(r.avg_rating || 0);
      });

      photoResults.forEach(p => {
        aggregateMap[p.cafe_id] = aggregateMap[p.cafe_id] || {};
        aggregateMap[p.cafe_id].cover_url = p.url;
      });
    }

    // Combine results
    const data = cafes.map(cafe => {
      const agg = aggregateMap[cafe.id] || {};
      return {
        id: cafe.id,
        name: cafe.name,
        address_line: cafe.address_line,
        city: cafe.city,
        status: cafe.status,
        avg_price_min: cafe.avg_price_min,
        avg_price_max: cafe.avg_price_max,
        open_time: cafe.open_time,
        close_time: cafe.close_time,
        favorites_count: Number(agg.favorites_count || 0),
        reviews_count: Number(agg.reviews_count || 0),
        avg_rating: Number(agg.avg_rating || 0),
        cover_url: agg.cover_url || null
      };
    });

    return {
      page: actualPage,
      limit: actualLimit,
      total: totalCafes,
      data
    };
  }
};

module.exports = ownerService;
