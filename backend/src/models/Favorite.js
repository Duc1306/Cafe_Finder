'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Favorite extends Model {
        static associate(models) {
            // Bảng trung gian thường không cần associate phức tạp trừ khi muốn query trực tiếp
        }
    }
    Favorite.init({
        user_id: DataTypes.BIGINT,
        cafe_id: DataTypes.BIGINT
    }, {
        sequelize,
        modelName: 'Favorite',
        tableName: 'favorites',
        underscored: true,
        timestamps: false
    });
    return Favorite;
};