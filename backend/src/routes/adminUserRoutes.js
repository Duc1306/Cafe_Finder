const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authMiddleware');

// Tất cả các route này yêu cầu xác thực Admin
router.use(authMiddleware);
router.use(authorize('ADMIN'));


router.get("/", adminUserController.getAllAccounts);
router.put("/:id", adminUserController.updateAccount);
router.delete("/:id", adminUserController.deleteAccount);
router.put("/:id/status", adminUserController.toggleStatus);
router.put("/:id/approve", adminUserController.approveOwner);



module.exports = router;
