const { Cafe } = require("../models");
const {Review} = require("../models");

const adminStatsService = {
  // 🔥 Lấy tổng số lượng quán cà phê
  getCafeCount: async () => {
    try {
      const total = await Cafe.count(); // COUNT(*) FROM Cafes
      return total;
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  },

  getReviewCount: async () => {
    const total = await Review.count();
    return total;
  },
};

module.exports = adminStatsService;
