// src/services/termsService.js
const { TermsOfUse } = require("../models");
const { Op } = require("sequelize");

const termsService = {
  /**
   * Get current active terms
   */
  getCurrentTerms: async () => {
    try {
      const terms = await TermsOfUse.findOne({
        where: { is_active: true },
        order: [["created_at", "DESC"]],
      });

      if (!terms) {
        throw { status: 404, message: "利用規約が見つかりません。" };
      }

      return terms;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all terms history
   */
  getAllTermsHistory: async () => {
    try {
      const terms = await TermsOfUse.findAll({
        order: [["created_at", "DESC"]],
      });

      return terms;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update terms and create new version
   */
  updateTerms: async (content, adminId) => {
    try {
      // Validate content
      if (!content || content.trim().length === 0) {
        throw { status: 400, message: "利用規約の内容を入力してください。" };
      }

      if (content.length > 50000) {
        throw { status: 400, message: "利用規約の内容が長すぎます。" };
      }

      // Get current active terms
      const currentTerms = await TermsOfUse.findOne({
        where: { is_active: true },
        order: [["created_at", "DESC"]],
      });

      // Calculate new version
      let newVersion = "1.0";
      if (currentTerms && currentTerms.version) {
        const versionParts = currentTerms.version.split(".");
        const major = parseInt(versionParts[0]) || 1;
        const minor = parseInt(versionParts[1]) || 0;
        newVersion = `${major}.${minor + 1}`;
      }

      // Deactivate current terms
      if (currentTerms) {
        await currentTerms.update({ is_active: false });
      }

      // Create new terms version
      const newTerms = await TermsOfUse.create({
        version: newVersion,
        content: content.trim(),
        is_active: true,
      });

      return {
        message: "利用規約が正常に更新されました。",
        terms: newTerms,
        previousVersion: currentTerms ? currentTerms.version : null,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get specific version of terms
   */
  getTermsByVersion: async (version) => {
    try {
      const terms = await TermsOfUse.findOne({
        where: { version },
      });

      if (!terms) {
        throw { status: 404, message: "指定されたバージョンの利用規約が見つかりません。" };
      }

      return terms;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = termsService;
