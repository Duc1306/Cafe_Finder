'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Favorite extends Model {
        static associate(models) {
            Favorite.belongsTo(models.Cafe, { foreignKey: 'cafe_id', as: 'cafe' });
            Favorite.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        }
    }
    Favorite.init({
        user_id: DataTypes.BIGINT,
        cafe_id: DataTypes.BIGINT,
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Favorite',
        tableName: 'Favorites',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });
    return Favorite;
};