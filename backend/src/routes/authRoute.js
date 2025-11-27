const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authMiddleware");

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/logout", authController.logout);

router.get("/owner/dashboard",
  authMiddleware,
  authorize("OWNER"),
  (req, res) => {
    res.json({ message: "Welcome OWNER" });
  }
);

router.get("/admin/users",
  authMiddleware,
  authorize("ADMIN"),
  (req, res) => {
    res.json({ message: "Admin page" });
  }
);

router.get("/customer",
  authMiddleware,
  authorize("CUSTOMER"),
  (req, res) => {
    res.json({ message: "Welcome CUSTOMER" });
  }
);



module.exports = router;
