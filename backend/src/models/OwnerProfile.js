'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OwnerProfile extends Model {
        static associate(models) {
            OwnerProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        }
    }
    OwnerProfile.init({
        user_id: { type: DataTypes.BIGINT, primaryKey: true },
        business_name: DataTypes.STRING,
        business_license_url: DataTypes.STRING,
        approval_status: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        approved_at: DataTypes.DATE,
        notes: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'OwnerProfile',
        tableName: 'OwnerProfiles',
        underscored: true,
        timestamps: false
    });
    return OwnerProfile;
};