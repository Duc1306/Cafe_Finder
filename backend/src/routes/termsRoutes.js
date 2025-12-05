// src/routes/termsRoutes.js
const express = require("express");
const router = express.Router();
const termsController = require("../controllers/termsController");
const authMiddleware = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authMiddleware");

// 🔓 Public routes - for users to view current terms during registration/login
router.get("/current", termsController.getPublicCurrentTerms);

// 🔐 Admin only routes - for managing terms
router.get(
  "/",
  authMiddleware,
  authorize("ADMIN"),
  termsController.getCurrentTerms
);

router.get(
  "/history",
  authMiddleware,
  authorize("ADMIN"),
  termsController.getTermsHistory
);

router.put(
  "/",
  authMiddleware,
  authorize("ADMIN"),
  termsController.updateTerms
);

router.get(
  "/:version",
  authMiddleware,
  authorize("ADMIN"),
  termsController.getTermsByVersion
);

module.exports = router;
