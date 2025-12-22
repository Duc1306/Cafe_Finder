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
  },

  /**
   * ============================================
   * POST /api/owner/shops/create
   * ============================================
   */
  createCafe: async (req, res, next) => {
    try {
      const ownerId = req.user.id;
      const cafeData = req.body;
      const photoFiles = req.files || [];

      // Validate required fields
      if (!cafeData.name || !cafeData.address_line || !cafeData.city || !cafeData.description) {
        return res.status(400).json({
          success: false,
          message: '必須項目を入力してください'
        });
      }

      if (!cafeData.opening_time || !cafeData.closing_time) {
        return res.status(400).json({
          success: false,
          message: '営業時間を入力してください'
        });
      }

      // Call service to create cafe
      const newCafe = await ownerService.createCafe(ownerId, cafeData, photoFiles);

      res.status(201).json({
        success: true,
        message: 'カフェを作成しました',
        data: newCafe
      });

    } catch (error) {
      console.error('Create cafe error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message || 'カフェの作成に失敗しました'
      });
    }
  },

  /**
   * ============================================
   * GET /api/owner/shops/:id
   * Get detailed cafe information
   * ============================================
   */
  getCafeDetail: async (req, res, next) => {
    try {
      const ownerId = req.user.id;
      const cafeId = req.params.id;

      const cafe = await ownerService.getCafeDetail(ownerId, cafeId);

      res.json({
        success: true,
        data: cafe
      });

    } catch (error) {
      if (error.message === 'Cafe not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'カフェが見つからないか、アクセス権限がありません'
        });
      }
      next(error);
    }
  },

  /**
   * ============================================
   * GET /api/owner/shops/:id/stats
   * Get cafe statistics
   * ============================================
   */
  getCafeStats: async (req, res, next) => {
    try {
      const ownerId = req.user.id;
      const cafeId = req.params.id;

      const stats = await ownerService.getCafeStats(ownerId, cafeId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      if (error.message === 'Cafe not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'カフェが見つかりません'
        });
      }
      next(error);
    }
  },

  /**
   * ============================================
   * GET /api/owner/shops/:id/reviews
   * Get recent reviews for cafe
   * ============================================
   */
  getCafeReviews: async (req, res, next) => {
    try {
      const ownerId = req.user.id;
      const cafeId = req.params.id;
      const limit = req.query.limit || 5;

      const reviews = await ownerService.getCafeReviews(ownerId, cafeId, limit);

      res.json({
        success: true,
        data: reviews
      });

    } catch (error) {
      if (error.message === 'Cafe not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'カフェが見つかりません'
        });
      }
      next(error);
    }
  },

  /**
   * ============================================
   * GET /api/owner/shops/:id/promotions
   * Get promotions for cafe
   * ============================================
   */
  getCafePromotions: async (req, res, next) => {
    try {
      const ownerId = req.user.id;
      const cafeId = req.params.id;

      const promotions = await ownerService.getCafePromotions(ownerId, cafeId);

      res.json({
        success: true,
        data: promotions
      });

    } catch (error) {
      if (error.message === 'Cafe not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'カフェが見つかりません'
        });
      }
      next(error);
    }
  },

  /**
   * ============================================
   * PUT /api/owner/shops/:id
   * Update existing cafe
   * ============================================
   */
  updateCafe: async (req, res, next) => {
    try {
      const ownerId = req.user.id;
      const cafeId = req.params.id;
      const cafeData = req.body;
      const newPhotoFiles = req.files || [];
      
      // Parse photosToDelete from JSON string
      let photosToDelete = [];
      if (cafeData.photos_to_delete) {
        try {
          photosToDelete = JSON.parse(cafeData.photos_to_delete);
        } catch (e) {
          console.error('Failed to parse photos_to_delete:', e);
        }
      }

      // Validate required fields
      if (!cafeData.name || !cafeData.address_line || !cafeData.city || !cafeData.description) {
        return res.status(400).json({
          success: false,
          message: '必須項目を入力してください'
        });
      }

      if (!cafeData.opening_time || !cafeData.closing_time) {
        return res.status(400).json({
          success: false,
          message: '営業時間を入力してください'
        });
      }

      // Call service to update cafe
      const updatedCafe = await ownerService.updateCafe(
        ownerId, 
        cafeId, 
        cafeData, 
        newPhotoFiles, 
        photosToDelete
      );

      res.json({
        success: true,
        message: 'カフェを更新しました',
        data: updatedCafe
      });

    } catch (error) {
      if (error.message === 'Cafe not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'カフェが見つからないか、アクセス権限がありません'
        });
      }
      console.error('Update cafe error:', error);
      next(error);
    }
  },

  /**
   * ============================================
   * DELETE /api/owner/shops/:id
   * Soft delete cafe (change status to CLOSED)
   * ============================================
   */
  deleteCafe: async (req, res, next) => {
    try {
      const ownerId = req.user.id;
      const cafeId = req.params.id;

      const result = await ownerService.deleteCafe(ownerId, cafeId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ============================================
   * POST /api/owner/shops/:id/promotions
   * Create new promotion for cafe
   * ============================================
   */
  createPromotion: async (req, res, next) => {
    try {
      const ownerId = req.user.id;
      const cafeId = req.params.id;
      const promotionData = req.body;

      // Validate required fields
      if (!promotionData.title || !promotionData.description) {
        return res.status(400).json({
          success: false,
          message: 'プロモーション名と説明は必須です'
        });
      }

      if (!promotionData.discount_type || !promotionData.discount_value) {
        return res.status(400).json({
          success: false,
          message: '割引設定は必須です'
        });
      }

      if (!promotionData.start_date || !promotionData.end_date) {
        return res.status(400).json({
          success: false,
          message: '実施期間は必須です'
        });
      }

      // Validate date range
      const startDate = new Date(promotionData.start_date);
      const endDate = new Date(promotionData.end_date);
      
      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          message: '終了日は開始日より後の日付を指定してください'
        });
      }

      // Create promotion
      const newPromotion = await ownerService.createPromotion(ownerId, cafeId, promotionData);

      res.status(201).json({
        success: true,
        message: 'プロモーションを作成しました',
        data: newPromotion
      });

    } catch (error) {
      if (error.message === 'Cafe not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'カフェが見つからないか、アクセス権限がありません'
        });
      }
      console.error('Create promotion error:', error);
      next(error);
    }
  }
};

module.exports = ownerController;
