'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'author' });
            Review.belongsTo(models.Cafe, { foreignKey: 'cafe_id', as: 'cafe' });
        }
    }
    Review.init({
        rating: DataTypes.INTEGER,
        comment: DataTypes.TEXT,
        image_url: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Review',
        tableName: 'Reviews',
        underscored: true,
    });
    return Review;
};