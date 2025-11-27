'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Promotion extends Model {
        static associate(models) {
            Promotion.belongsTo(models.Cafe, { foreignKey: 'cafe_id', as: 'cafe' });
        }
    }
    Promotion.init({
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        discount_type: DataTypes.ENUM('PERCENT', 'FIXED_AMOUNT'),
        discount_value: DataTypes.DECIMAL(10, 2),
        start_date: DataTypes.DATEONLY,
        end_date: DataTypes.DATEONLY,
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Promotion',
        tableName: 'promotions',
        underscored: true,
    });
    return Promotion;
};