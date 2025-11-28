const ownerService = require('../services/ownerService');

const ownerController = {
  /**
   * GET /api/owner/dashboard/overview
   * Get dashboard statistics for owner
   */
  getDashboardOverview: async (req, res, next) => {
    try {
      const ownerId = req.user.id; // From JWT token
      
      const stats = await ownerService.getDashboardStats(ownerId);
      
      res.json({
        ownerId,
        ...stats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/owner/shops?page=1&limit=8&keyword=&city=
   * Get paginated list of cafes for owner
   */
  getShops: async (req, res, next) => {
    try {
      const ownerId = req.user.id; // From JWT token
      
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        keyword: req.query.keyword,
        city: req.query.city
      };
      
      const result = await ownerService.getOwnerCafes(ownerId, filters);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ownerController;
