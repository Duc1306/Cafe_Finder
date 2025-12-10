const {Cafe} = require("../models");
const {Review} = require("../models");
const {User} = require("../models");
const { Sequelize } = require("sequelize");


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

  //get all users'reviews
  getReviewCount: async () => {
    const total = await Review.count();
    return total;
  },

  //get all users'accounts created by month
  getUserStatsByMonth: async () => {
    const stats = await User.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("created_at")), "month"],
        "role",
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      group: ["month", "role"],
      order: [[Sequelize.literal("month"), "ASC"]],
    });

    return stats;
  }
};

module.exports = adminStatsService;
