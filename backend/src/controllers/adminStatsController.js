const adminStatsService = require("../services/adminStatsService");

const adminStatsController = {
  // 📌 GET /api/admin/stats/cafes/count
  getCafeCount: async (req, res) => {
    try {
      const total = await adminStatsService.getCafeCount();

      return res.status(200).json({
        success: true,
        totalCafes: total,
      });
    } catch (error) {
      console.error("Get cafe count error:", error);
      return res.status(500).json({
        success: false,
        message: "サーバーエラーが発生しました。",
      });
    }
  },
  getReviewCount: async (req, res) => {
    try {
      const total = await adminStatsService.getReviewCount();
      return res.status(200).json({ success: true, totalReviews: total });
    } catch {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
};

module.exports = adminStatsController;
