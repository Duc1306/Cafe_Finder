'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      type: {
        type: Sequelize.ENUM('NEW_USER', 'NEW_CAFE', 'REPORT', 'SYSTEM'),
        allowNull: false
      },
      title: { type: Sequelize.STRING },
      content: { type: Sequelize.TEXT },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_type";');
  }
};