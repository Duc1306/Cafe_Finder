'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CafePhoto extends Model {
        static associate(models) {
            CafePhoto.belongsTo(models.Cafe, { foreignKey: 'cafe_id', as: 'cafe' });
        }
    }
    CafePhoto.init({
        url: DataTypes.STRING,
        photo_type: DataTypes.ENUM('INTERIOR', 'EXTERIOR', 'MENU', 'FOOD'),
        is_cover: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'CafePhoto',
        tableName: 'CafePhotos',
        underscored: true,
    });
    return CafePhoto;
};