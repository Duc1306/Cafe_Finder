// src/controllers/termsController.js
const termsService = require("../services/termsService");

const termsController = {
  /**
   * GET /admin/terms - Get current active terms
   */
  getCurrentTerms: async (req, res) => {
    try {
      const terms = await termsService.getCurrentTerms();

      return res.status(200).json({
        success: true,
        data: {
          id: terms.id,
          version: terms.version,
          content: terms.content,
          is_active: terms.is_active,
          created_at: terms.created_at,
          updated_at: terms.updated_at,
        },
      });
    } catch (error) {
      console.error("Get current terms error:", error);
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      return res.status(status).json({
        success: false,
        error: message,
      });
    }
  },

  /**
   * GET /admin/terms/history - Get all terms history
   */
  getTermsHistory: async (req, res) => {
    try {
      const terms = await termsService.getAllTermsHistory();

      return res.status(200).json({
        success: true,
        data: terms.map((term) => ({
          id: term.id,
          version: term.version,
          content: term.content,
          is_active: term.is_active,
          created_at: term.created_at,
          updated_at: term.updated_at,
        })),
      });
    } catch (error) {
      console.error("Get terms history error:", error);
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      return res.status(status).json({
        success: false,
        error: message,
      });
    }
  },

  /**
   * PUT /admin/terms - Update terms and create new version
   */
  updateTerms: async (req, res) => {
    try {
      const { content } = req.body;
      const adminId = req.user.id; // From JWT token

      if (!content) {
        return res.status(400).json({
          success: false,
          error: "利用規約の内容を入力してください。",
        });
      }

      const result = await termsService.updateTerms(content, adminId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          id: result.terms.id,
          version: result.terms.version,
          content: result.terms.content,
          is_active: result.terms.is_active,
          created_at: result.terms.created_at,
          updated_at: result.terms.updated_at,
        },
        previousVersion: result.previousVersion,
      });
    } catch (error) {
      console.error("Update terms error:", error);
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      return res.status(status).json({
        success: false,
        error: message,
      });
    }
  },

  /**
   * GET /admin/terms/:version - Get specific version
   */
  getTermsByVersion: async (req, res) => {
    try {
      const { version } = req.params;
      const terms = await termsService.getTermsByVersion(version);

      return res.status(200).json({
        success: true,
        data: {
          id: terms.id,
          version: terms.version,
          content: terms.content,
          is_active: terms.is_active,
          created_at: terms.created_at,
          updated_at: terms.updated_at,
        },
      });
    } catch (error) {
      console.error("Get terms by version error:", error);
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      return res.status(status).json({
        success: false,
        error: message,
      });
    }
  },

  /**
   * GET /api/terms/current - Public endpoint for getting current terms
   * (For user registration/login popup)
   */
  getPublicCurrentTerms: async (req, res) => {
    try {
      const terms = await termsService.getCurrentTerms();

      return res.status(200).json({
        success: true,
        data: {
          id: terms.id,
          version: terms.version,
          content: terms.content,
          created_at: terms.created_at,
        },
      });
    } catch (error) {
      console.error("Get public current terms error:", error);
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      return res.status(status).json({
        success: false,
        error: message,
      });
    }
  },
};

module.exports = termsController;
