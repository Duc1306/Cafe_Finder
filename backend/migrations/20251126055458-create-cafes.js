'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cafes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      owner_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' }, // Khóa ngoại trỏ tới bảng Users
        onDelete: 'CASCADE'
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },

      // Địa chỉ
      address_line: { type: Sequelize.STRING, allowNull: false },
      district: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      latitude: { type: Sequelize.DECIMAL(9, 6) },
      longitude: { type: Sequelize.DECIMAL(9, 6) },

      // Liên hệ & Web
      phone_contact: { type: Sequelize.STRING },
      website_url: { type: Sequelize.STRING },

      // Giờ mở cửa
      open_time: { type: Sequelize.TIME },
      close_time: { type: Sequelize.TIME },

      // Giá & Tiện ích
      avg_price_min: { type: Sequelize.INTEGER },
      avg_price_max: { type: Sequelize.INTEGER },
      has_wifi: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_ac: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_quiet: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_parking: { type: Sequelize.BOOLEAN, defaultValue: false },
      allow_smoking: { type: Sequelize.BOOLEAN, defaultValue: false },
      allow_pets: { type: Sequelize.BOOLEAN, defaultValue: false },

      amenities_text: { type: Sequelize.TEXT },

      status: {
        type: Sequelize.ENUM('PENDING', 'ACTIVE', 'REJECTED', 'CLOSED'),
        defaultValue: 'PENDING'
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Cafes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Cafes_status";');
  }
};