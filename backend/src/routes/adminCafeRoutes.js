const express = require('express');
const router = express.Router();
const adminCafeController = require('../controllers/adminCafeController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authMiddleware');

// Tất cả các route này yêu cầu xác thực Admin
router.use(authMiddleware);
router.use(authorize('ADMIN'));

/**
 * GET /api/admin/cafes
 * Lấy danh sách tất cả quán đang hoạt động
 * Query params: page, limit, keyword, city, status
 */
router.get('/', adminCafeController.getAllCafes);

/**
 * GET /api/admin/cafes/requests
 * Lấy danh sách quán chờ duyệt (status = PENDING)
 * Query params: page, limit, keyword
 */
router.get('/requests', adminCafeController.getPendingRequests);

/**
 * GET /api/admin/cafes/requests/:id
 * Lấy chi tiết yêu cầu duyệt quán
 */
router.get('/requests/:id', adminCafeController.getRequestDetail);

/**
 * PUT /api/admin/cafes/requests/:id/approve
 * Duyệt yêu cầu mở quán mới
 */
router.put('/requests/:id/approve', adminCafeController.approveRequest);

/**
 * PUT /api/admin/cafes/requests/:id/reject
 * Từ chối yêu cầu mở quán
 * Body: { reason: string }
 */
router.put('/requests/:id/reject', adminCafeController.rejectRequest);

/**
 * GET /api/admin/cafes/:id
 * Lấy chi tiết quán
 */
router.get('/:id', adminCafeController.getCafeDetail);

/**
 * PUT /api/admin/cafes/:id
 * Chỉnh sửa thông tin quán
 */
router.put('/:id', adminCafeController.updateCafe);

/**
 * DELETE /api/admin/cafes/:id
 * Xóa quán (soft delete - chuyển status thành CLOSED)
 */
router.delete('/:id', adminCafeController.deleteCafe);

module.exports = router;
