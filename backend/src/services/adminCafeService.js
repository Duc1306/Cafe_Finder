const { Cafe, User, OwnerProfile, CafePhoto, Review } = require('../models');
const { Op } = require('sequelize');


/**
 * Lấy danh sách tất cả quán
 * @param {Object} filters - { page, limit, keyword, city, status }
 * @returns {Object} - { cafes, total, totalPages, currentPage }
 */
const getAllCafes = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword = '',
      city = '',
      status = ''
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter theo status (only if provided)
    if (status && status.trim() !== '') {
      whereClause.status = status;
    }

    // Filter theo keyword (tìm trong tên quán)
    if (keyword) {
      whereClause.name = {
        [Op.like]: `%${keyword}%`
      };
    }

    // Filter theo thành phố
    if (city) {
      whereClause.city = city;
    }

    const { count, rows } = await Cafe.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email', 'phone'],
          include: [
            {
              model: OwnerProfile,
              as: 'ownerProfile',
              attributes: ['business_name', 'approval_status']
            }
          ]
        },
        {
          model: CafePhoto,
          as: 'photos',
          attributes: ['id', 'url', 'photo_type', 'is_cover'],
          limit: 1,
          where: { is_cover: true },
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    // Add base URL to cover photos
    const useCloudinary = process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true';
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const cafesWithFullUrls = rows.map(cafe => {
      const cafeData = cafe.toJSON();
      if (cafeData.photos && cafeData.photos.length > 0) {
        cafeData.photos = cafeData.photos.map(photo => ({
          ...photo,
          url: useCloudinary || photo.url.startsWith('http') ? photo.url : `${baseURL}${photo.url}`
        }));
      }
      return cafeData;
    });

    return {
      cafes: cafesWithFullUrls,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    };
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
};

/**
 * Lấy danh sách quán chờ duyệt (PENDING)
 * @param {Object} filters - { page, limit, keyword }
 * @returns {Object} - { requests, total, totalPages, currentPage }
 */
const getPendingRequests = async (filters = {}) => {
  try {
    const { page = 1, limit = 10, keyword = '' } = filters;
    const offset = (page - 1) * limit;

    const whereClause = { status: 'PENDING' };

    if (keyword) {
      whereClause.name = {
        [Op.like]: `%${keyword}%`
      };
    }

    const { count, rows } = await Cafe.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email', 'phone'],
          include: [
            {
              model: OwnerProfile,
              as: 'ownerProfile',
              attributes: ['business_name', 'business_license_url']
            }
          ]
        },
        {
          model: CafePhoto,
          as: 'photos',
          attributes: ['id', 'url', 'photo_type', 'is_cover']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']], // Yêu cầu cũ nhất trước
      distinct: true
    });

    // Add base URL to photos
    const useCloudinary = process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true';
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const requestsWithFullUrls = rows.map(cafe => {
      const cafeData = cafe.toJSON();
      if (cafeData.photos && cafeData.photos.length > 0) {
        cafeData.photos = cafeData.photos.map(photo => ({
          ...photo,
          url: useCloudinary || photo.url.startsWith('http') ? photo.url : `${baseURL}${photo.url}`
        }));
      }
      return cafeData;
    });

    return {
      requests: requestsWithFullUrls,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    };
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
};

/**
 * Lấy chi tiết yêu cầu duyệt quán
 * @param {number} cafeId
 * @returns {Object} - cafe detail
 */
const getRequestDetail = async (cafeId) => {
  try {
    const cafe = await Cafe.findOne({
      where: {
        id: cafeId,
        status: 'PENDING'
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
          include: [
            {
              model: OwnerProfile,
              as: 'ownerProfile'
            }
          ]
        },
        {
          model: CafePhoto,
          as: 'photos'
        }
      ]
    }); if (!cafe) {
      throw new Error('Request not found or already processed');
    }

    // Add base URL to photos
    const useCloudinary = process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true';
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const cafeData = cafe.toJSON();
    
    if (cafeData.photos && cafeData.photos.length > 0) {
      cafeData.photos = cafeData.photos.map(photo => ({
        ...photo,
        url: useCloudinary || photo.url.startsWith('http') ? photo.url : `${baseURL}${photo.url}`
      }));
    }

    return cafeData;
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
};

/**
 * Duyệt yêu cầu mở quán
 * @param {number} cafeId
 * @returns {Object} - updated cafe
 */
const approveRequest = async (cafeId) => {
  try {
    const cafe = await Cafe.findOne({
      where: {
        id: cafeId,
        status: 'PENDING'
      }
    });

    if (!cafe) {
      throw new Error('Request not found or already processed');
    }

    // Cập nhật trạng thái quán
    cafe.status = 'ACTIVE';
    await cafe.save();

    // Lấy thông tin đầy đủ để trả về
    const updatedCafe = await Cafe.findByPk(cafeId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email', 'phone']
        }
      ]
    });

    return updatedCafe;
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
};

/**
 * Từ chối yêu cầu mở quán
 * @param {number} cafeId
 * @param {string} reason
 * @returns {Object} - updated cafe
 */
const rejectRequest = async (cafeId, reason = '') => {
  try {
    const cafe = await Cafe.findOne({
      where: {
        id: cafeId,
        status: 'PENDING'
      }
    });

    if (!cafe) {
      throw new Error('Request not found or already processed');
    }

    // Cập nhật trạng thái quán
    cafe.status = 'REJECTED';
    // Lưu lý do từ chối vào description hoặc tạo field mới
    if (reason) {
      cafe.description = `[REJECTED] ${reason}\n\n${cafe.description || ''}`;
    }
    await cafe.save();

    return cafe;
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
};

/**
 * Lấy chi tiết quán
 * @param {number} cafeId
 * @returns {Object} - cafe detail
 */
const getCafeDetail = async (cafeId) => {
  try {
    const cafe = await Cafe.findByPk(cafeId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
          include: [
            {
              model: OwnerProfile,
              as: 'ownerProfile'
            }
          ]
        },
        {
          model: CafePhoto,
          as: 'photos',
          order: [['is_cover', 'DESC']]
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'full_name', 'avatar_url']
            }
          ],
          order: [['created_at', 'DESC']],
          limit: 5
        }
      ]
    });

    if (!cafe) {
      throw new Error('Cafe not found');
    }

    // Tính rating trung bình
    const reviews = await Review.findAll({
      where: { cafe_id: cafeId },
      attributes: ['rating']
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Add base URL to photos
    const useCloudinary = process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true';
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const cafeData = cafe.toJSON();
    
    if (cafeData.photos && cafeData.photos.length > 0) {
      cafeData.photos = cafeData.photos.map(photo => ({
        ...photo,
        url: useCloudinary || photo.url.startsWith('http') ? photo.url : `${baseURL}${photo.url}`
      }));
    }

    return {
      ...cafeData,
      avgRating: avgRating.toFixed(1),
      totalReviews: reviews.length
    };
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
};

/**
 * Cập nhật thông tin quán
 * @param {number} cafeId
 * @param {Object} updateData
 * @returns {Object} - updated cafe
 */
const updateCafe = async (cafeId, updateData) => {
  try {
    const cafe = await Cafe.findByPk(cafeId);

    if (!cafe) {
      throw new Error('Cafe not found');
    }

    // Các trường có thể cập nhật
    const allowedFields = [
      'name',
      'description',
      'address_line',
      'district',
      'city',
      'latitude',
      'longitude',
      'phone_contact',
      'website_url',
      'open_time',
      'close_time',
      'avg_price_min',
      'avg_price_max',
      'has_wifi',
      'has_ac',
      'is_quiet',
      'has_parking',
      'allow_smoking',
      'allow_pets',
      'amenities_text',
      'status'
    ];

    // Chỉ cập nhật các trường được phép
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        cafe[field] = updateData[field];
      }
    });

    await cafe.save();

    // Lấy thông tin đầy đủ sau khi cập nhật
    const updatedCafe = await getCafeDetail(cafeId);
    return updatedCafe;
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
};

/**
 * Xóa quán (soft delete - chuyển status thành CLOSED)
 * @param {number} cafeId
 * @returns {Object}
 */
const deleteCafe = async (cafeId) => {
  try {
    const cafe = await Cafe.findByPk(cafeId);

    if (!cafe) {
      throw new Error('Cafe not found');
    }

    // Soft delete: chuyển status thành CLOSED
    cafe.status = 'CLOSED';
    await cafe.save();

    return { success: true, message: 'Cafe deleted successfully' };
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
};

module.exports = {
  getAllCafes,
  getPendingRequests,
  getRequestDetail,
  approveRequest,
  rejectRequest,
  getCafeDetail,
  updateCafe,
  deleteCafe
};
