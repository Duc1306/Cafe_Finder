'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OwnerProfiles', {
      user_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      business_name: { type: Sequelize.STRING },
      business_license_url: { type: Sequelize.STRING(500) },
      approval_status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING'
      },
      approved_at: { type: Sequelize.DATE },
      notes: { type: Sequelize.TEXT }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OwnerProfiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_OwnerProfiles_approval_status";');
  }
};