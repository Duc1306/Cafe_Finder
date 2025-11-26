'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CafePhotos', {
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
      url: { type: Sequelize.STRING(500), allowNull: false },

      photo_type: {
        type: Sequelize.ENUM('INTERIOR', 'EXTERIOR', 'MENU', 'FOOD'),
        defaultValue: 'INTERIOR'
      },
      is_cover: { type: Sequelize.BOOLEAN, defaultValue: false },

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
    await queryInterface.dropTable('CafePhotos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_CafePhotos_photo_type";');
  }
};