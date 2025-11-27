'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Promotions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      cafe_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Cafes', key: 'id' },
        onDelete: 'CASCADE'
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },

      // Logic Discount
      discount_type: {
        type: Sequelize.ENUM('PERCENT', 'FIXED_AMOUNT'),
        defaultValue: 'PERCENT'
      },
      discount_value: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },

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
    await queryInterface.dropTable('Promotions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Promotions_discount_type";');
  }
};