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

    // Base URL for images
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

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
        cover_url: agg.cover_url ? `${baseURL}${agg.cover_url}` : null // ADD baseURL
      };
    });

    return {
      page: actualPage,
      limit: actualLimit,
      total: totalCafes,
      data
    };
  },

  /**
   * Create new cafe
   */
  createCafe: async (ownerId, cafeData, photoFiles = []) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Tạo cafe mới
      const newCafe = await Cafe.create({
        owner_id: ownerId,
        name: cafeData.name,
        address_line: cafeData.address_line,
        district: cafeData.district || null,
        city: cafeData.city,
        description: cafeData.description,
        phone_contact: cafeData.phone_contact || null,
        website_url: cafeData.website_url || null,
        open_time: cafeData.opening_time,
        close_time: cafeData.closing_time,
        avg_price_min: cafeData.avg_price_min ? parseInt(cafeData.avg_price_min) : null,
        avg_price_max: cafeData.avg_price_max ? parseInt(cafeData.avg_price_max) : null,
        has_wifi: cafeData.has_wifi === 'true' || cafeData.has_wifi === true,
        has_ac: cafeData.has_ac === 'true' || cafeData.has_ac === true,
        has_parking: cafeData.has_parking === 'true' || cafeData.has_parking === true,
        is_quiet: cafeData.is_quiet === 'true' || cafeData.is_quiet === true,
        allow_smoking: cafeData.allow_smoking === 'true' || cafeData.allow_smoking === true,
        allow_pets: cafeData.allow_pets === 'true' || cafeData.allow_pets === true,
        has_outlet: cafeData.has_outlet === 'true' || cafeData.has_outlet === true,
        status: 'PENDING' // Mặc định chờ duyệt
      }, { transaction });

      // Nếu có ảnh, lưu vào CafePhotos
      if (photoFiles && photoFiles.length > 0) {
        const photoRecords = photoFiles.map((file, index) => ({
          cafe_id: newCafe.id,
          url: `/uploads/cafes/${file.filename}`, // Path bắt đầu với /
          photo_type: 'INTERIOR',
          is_cover: index === 0
        }));

        await CafePhoto.bulkCreate(photoRecords, { transaction });
      }

      await transaction.commit();

      // Lấy lại cafe với photos
      const cafe = await Cafe.findByPk(newCafe.id, {
        include: [{
          model: CafePhoto,
          as: 'photos',
          attributes: ['id', 'url', 'photo_type', 'is_cover']
        }]
      });

      return cafe;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Get detailed cafe information for owner
   */
  getCafeDetail: async (ownerId, cafeId) => {
    // Kiểm tra cafe có tồn tại và thuộc owner không
    const cafe = await Cafe.findOne({
      where: { 
        id: cafeId,
        owner_id: ownerId 
      },
      include: [
        {
          model: CafePhoto,
          as: 'photos',
          attributes: ['id', 'url', 'photo_type', 'is_cover']
        }
      ]
    });

    if (!cafe) {
      throw new Error('Cafe not found or unauthorized');
    }

    // Convert to plain object
    const cafeData = cafe.toJSON();
    
    // Base URL for images
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    // Add full URL to photos
    if (cafeData.photos && cafeData.photos.length > 0) {
      cafeData.photos = cafeData.photos.map(photo => ({
        ...photo,
        url: `${baseURL}${photo.url}`
      }));
      
      // Find cover photo
      const coverPhoto = cafeData.photos.find(p => p.is_cover);
      cafeData.cover_url = coverPhoto ? coverPhoto.url : null;
    } else {
      cafeData.cover_url = null;
    }

    return cafeData;
  },

  /**
   * Get cafe statistics (favorites, reviews, rating distribution)
   */
  getCafeStats: async (ownerId, cafeId) => {
    // Verify ownership
    const cafe = await Cafe.findOne({
      where: { id: cafeId, owner_id: ownerId },
      attributes: ['id']
    });

    if (!cafe) {
      throw new Error('Cafe not found or unauthorized');
    }

    // Count favorites
    const favoritesCount = await Favorite.count({
      where: { cafe_id: cafeId }
    });

    // Count reviews
    const reviewsCount = await Review.count({
      where: { cafe_id: cafeId }
    });

    // Get rating distribution
    const ratingDistribution = await Review.findAll({
      where: { cafe_id: cafeId },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });

    // Format rating distribution for chart
    const formattedDistribution = [5, 4, 3, 2, 1].map(star => {
      const found = ratingDistribution.find(r => r.rating === star);
      const count = found ? Number(found.count) : 0;
      const percentage = reviewsCount > 0 ? Math.round((count / reviewsCount) * 100) : 0;
      return {
        name: `${star}★`,
        value: count,
        percentage
      };
    });

    return {
      favorites: favoritesCount,
      reviews: reviewsCount,
      ratingDistribution: formattedDistribution
    };
  },

  /**
   * Get recent reviews for a cafe
   */
  getCafeReviews: async (ownerId, cafeId, limit = 5) => {
    // Verify ownership
    const cafe = await Cafe.findOne({
      where: { id: cafeId, owner_id: ownerId },
      attributes: ['id']
    });

    if (!cafe) {
      throw new Error('Cafe not found or unauthorized');
    }

    const { User } = require('../models');
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

    const reviews = await Review.findAll({
      where: { cafe_id: cafeId },
      attributes: ['id', 'rating', 'comment', 'created_at'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'avatar_url']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit)
    });

    // Format response
    return reviews.map(review => ({
      id: review.id,
      user_name: review.author?.full_name || '匿名',
      user_avatar: review.author?.avatar_url ? `${baseURL}${review.author.avatar_url}` : null,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at
    }));
  },

  /**
   * Get promotions for a cafe
   */
  getCafePromotions: async (ownerId, cafeId) => {
    // Verify ownership
    const cafe = await Cafe.findOne({
      where: { id: cafeId, owner_id: ownerId },
      attributes: ['id']
    });

    if (!cafe) {
      throw new Error('Cafe not found or unauthorized');
    }

    const { Promotion } = require('../models');

    const promotions = await Promotion.findAll({
      where: { cafe_id: cafeId },
      order: [
        ['is_active', 'DESC'],
        ['start_date', 'DESC']
      ]
    });

    // Add mock views count (cần thêm table tracking sau)
    return promotions.map(promo => ({
      id: promo.id,
      title: promo.title,
      description: promo.description,
      discount_type: promo.discount_type,
      discount_value: Number(promo.discount_value),
      start_date: promo.start_date,
      end_date: promo.end_date,
      is_active: promo.is_active,
      views: Math.floor(Math.random() * 2000) + 500 // Mock data
    }));
  },

  /**
   * Update existing cafe
   */
  updateCafe: async (ownerId, cafeId, cafeData, newPhotoFiles = [], photosToDelete = []) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Verify ownership
      const cafe = await Cafe.findOne({
        where: { 
          id: cafeId,
          owner_id: ownerId 
        }
      });

      if (!cafe) {
        throw new Error('Cafe not found or unauthorized');
      }

      // Update cafe information
      await cafe.update({
        name: cafeData.name,
        address_line: cafeData.address_line,
        district: cafeData.district || null,
        city: cafeData.city,
        description: cafeData.description,
        phone_contact: cafeData.phone_contact || null,
        website_url: cafeData.website_url || null,
        open_time: cafeData.opening_time,
        close_time: cafeData.closing_time,
        avg_price_min: cafeData.avg_price_min ? parseInt(cafeData.avg_price_min) : null,
        avg_price_max: cafeData.avg_price_max ? parseInt(cafeData.avg_price_max) : null,
        has_wifi: cafeData.has_wifi === 'true' || cafeData.has_wifi === true,
        has_ac: cafeData.has_ac === 'true' || cafeData.has_ac === true,
        has_parking: cafeData.has_parking === 'true' || cafeData.has_parking === true,
        is_quiet: cafeData.is_quiet === 'true' || cafeData.is_quiet === true,
        allow_smoking: cafeData.allow_smoking === 'true' || cafeData.allow_smoking === true,
        allow_pets: cafeData.allow_pets === 'true' || cafeData.allow_pets === true,
        has_outlet: cafeData.has_outlet === 'true' || cafeData.has_outlet === true
      }, { transaction });

      // Delete photos if requested
      if (photosToDelete && photosToDelete.length > 0) {
        const fs = require('fs');
        const path = require('path');

        // Get photos from database
        const photosToRemove = await CafePhoto.findAll({
          where: {
            id: photosToDelete,
            cafe_id: cafeId
          }
        });

        // Delete files from filesystem
        for (const photo of photosToRemove) {
          const filePath = path.join(__dirname, '../../', photo.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        // Delete from database
        await CafePhoto.destroy({
          where: {
            id: photosToDelete,
            cafe_id: cafeId
          },
          transaction
        });
      }

      // Add new photos
      if (newPhotoFiles && newPhotoFiles.length > 0) {
        // Check if there are existing photos
        const remainingPhotosCount = await CafePhoto.count({
          where: { cafe_id: cafeId }
        });

        const photoRecords = newPhotoFiles.map((file, index) => ({
          cafe_id: cafeId,
          url: `/uploads/cafes/${file.filename}`,
          photo_type: 'INTERIOR',
          is_cover: remainingPhotosCount === 0 && index === 0 // Set first new photo as cover if no photos remain
        }));

        await CafePhoto.bulkCreate(photoRecords, { transaction });
      }

      await transaction.commit();

      // Return updated cafe with photos
      const updatedCafe = await Cafe.findByPk(cafeId, {
        include: [{
          model: CafePhoto,
          as: 'photos',
          attributes: ['id', 'url', 'photo_type', 'is_cover']
        }]
      });

      return updatedCafe;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Delete cafe (soft delete - change status to CLOSED)
   */
  deleteCafe: async (ownerId, cafeId) => {
    try {
      // Verify ownership
      const cafe = await Cafe.findOne({
        where: { id: cafeId, owner_id: ownerId }
      });

      if (!cafe) {
        throw new Error('Cafe not found or unauthorized');
      }

      // Soft delete: change status to CLOSED
      cafe.status = 'CLOSED';
      await cafe.save();

      return { success: true, message: 'Cafe deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = ownerService;
