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
        cafe_id: DataTypes.BIGINT
    }, {
        sequelize,
        modelName: 'Favorite',
        tableName: 'Favorites',
        underscored: true,
        timestamps: false
    });
    return Favorite;
};