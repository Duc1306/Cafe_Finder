'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Cafe extends Model {
        static associate(models) {
            Cafe.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
            Cafe.hasMany(models.CafePhoto, { foreignKey: 'cafe_id', as: 'photos' });
            Cafe.hasMany(models.Review, { foreignKey: 'cafe_id', as: 'reviews' });
            Cafe.hasMany(models.Promotion, { foreignKey: 'cafe_id', as: 'promotions' });
            Cafe.belongsToMany(models.User, {
                through: models.Favorite,
                foreignKey: 'cafe_id',
                as: 'favoritedByUsers'
            });
        }
    }
    Cafe.init({
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        address_line: DataTypes.STRING,
        district: DataTypes.STRING,
        city: DataTypes.STRING,
        latitude: DataTypes.DECIMAL(9, 6),
        longitude: DataTypes.DECIMAL(9, 6),
        phone_contact: DataTypes.STRING,
        website_url: DataTypes.STRING,
        open_time: DataTypes.TIME,
        close_time: DataTypes.TIME,
        avg_price_min: DataTypes.INTEGER,
        avg_price_max: DataTypes.INTEGER,
        has_wifi: DataTypes.BOOLEAN,
        has_ac: DataTypes.BOOLEAN,
        is_quiet: DataTypes.BOOLEAN,
        has_parking: DataTypes.BOOLEAN,
        allow_smoking: DataTypes.BOOLEAN,
        allow_pets: DataTypes.BOOLEAN,
        amenities_text: DataTypes.TEXT,
        status: DataTypes.ENUM('PENDING', 'ACTIVE', 'REJECTED', 'CLOSED')
    }, {
        sequelize,
        modelName: 'Cafe',
        tableName: 'Cafes',
        underscored: true,
    });
    return Cafe;
};