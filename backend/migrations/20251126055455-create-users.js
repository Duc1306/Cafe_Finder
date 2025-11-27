'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM('ADMIN', 'OWNER', 'CUSTOMER'),
        allowNull: false
      },
      full_name: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING },
      avatar_url: { type: Sequelize.STRING(500) },
      dob: { type: Sequelize.DATEONLY },
      address: { type: Sequelize.STRING },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'PENDING', 'LOCKED'),
        defaultValue: 'ACTIVE'
      },
      agreed_terms_id: {
        type: Sequelize.BIGINT,
        references: { model: 'TermsOfUses', key: 'id' }
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
    await queryInterface.dropTable('Users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_status";');
  }
};