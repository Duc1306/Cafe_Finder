const adminCafeService = require('../services/adminCafeService');

/**
 * GET /api/admin/cafes
 * Lấy danh sách tất cả quán
 */
const getAllCafes = async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      keyword: req.query.keyword || '',
      city: req.query.city || '',
      status: req.query.status !== undefined ? req.query.status : ''
    };

    const result = await adminCafeService.getAllCafes(filters);

    res.status(200).json({
      success: true,
      data: result.cafes,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: parseInt(filters.limit)
      }
    });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cafes'
    });
  }
};

/**
 * GET /api/admin/cafes/requests
 * Lấy danh sách quán chờ duyệt
 */
const getPendingRequests = async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      keyword: req.query.keyword || ''
    };

    const result = await adminCafeService.getPendingRequests(filters);

    res.status(200).json({
      success: true,
      data: result.requests,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: parseInt(filters.limit)
      }
    });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pending requests'
    });
  }
};

/**
 * GET /api/admin/cafes/requests/:id
 * Lấy chi tiết yêu cầu duyệt quán
 */
const getRequestDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cafe ID'
      });
    }

    const cafe = await adminCafeService.getRequestDetail(parseInt(id));

    res.status(200).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Controller Error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch request detail'
    });
  }
};

/**
 * PUT /api/admin/cafes/requests/:id/approve
 * Duyệt yêu cầu mở quán
 */
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cafe ID'
      });
    }

    const updatedCafe = await adminCafeService.approveRequest(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Cafe approved successfully',
      data: updatedCafe
    });
  } catch (error) {
    console.error('Controller Error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve request'
    });
  }
};

/**
 * PUT /api/admin/cafes/requests/:id/reject
 * Từ chối yêu cầu mở quán
 */
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cafe ID'
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const updatedCafe = await adminCafeService.rejectRequest(parseInt(id), reason);

    res.status(200).json({
      success: true,
      message: 'Cafe request rejected',
      data: updatedCafe
    });
  } catch (error) {
    console.error('Controller Error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject request'
    });
  }
};

/**
 * GET /api/admin/cafes/:id
 * Lấy chi tiết quán
 */
const getCafeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cafe ID'
      });
    }

    const cafe = await adminCafeService.getCafeDetail(parseInt(id));

    res.status(200).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Controller Error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cafe detail'
    });
  }
};

/**
 * PUT /api/admin/cafes/:id
 * Cập nhật thông tin quán
 */
const updateCafe = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cafe ID'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }

    const updatedCafe = await adminCafeService.updateCafe(parseInt(id), updateData);

    res.status(200).json({
      success: true,
      message: 'Cafe updated successfully',
      data: updatedCafe
    });
  } catch (error) {
    console.error('Controller Error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cafe'
    });
  }
};

/**
 * DELETE /api/admin/cafes/:id
 * Xóa quán (soft delete)
 */
const deleteCafe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cafe ID'
      });
    }

    await adminCafeService.deleteCafe(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Cafe deleted successfully'
    });
  } catch (error) {
    console.error('Controller Error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete cafe'
    });
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
