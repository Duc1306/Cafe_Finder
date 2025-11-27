'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // 1 User có 1 Hồ sơ chủ quán
            User.hasOne(models.OwnerProfile, { foreignKey: 'user_id', as: 'ownerProfile' });
            // 1 Chủ quán sở hữu nhiều Quán
            User.hasMany(models.Cafe, { foreignKey: 'owner_id', as: 'ownedCafes' });
            // 1 User viết nhiều Review
            User.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
            // 1 User thích nhiều quán (Many-to-Many)
            User.belongsToMany(models.Cafe, {
                through: models.Favorite,
                foreignKey: 'user_id',
                as: 'favoriteCafes'
            });
        }
    }
    User.init({
        full_name: DataTypes.STRING,
        email: DataTypes.STRING,
        password_hash: DataTypes.STRING,
        role: DataTypes.ENUM('ADMIN', 'OWNER', 'CUSTOMER'),
        phone: DataTypes.STRING,
        avatar_url: DataTypes.STRING,
        dob: DataTypes.DATEONLY,
        address: DataTypes.STRING,
        status: DataTypes.ENUM('ACTIVE', 'PENDING', 'LOCKED'),
        agreed_terms_id: DataTypes.BIGINT
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        underscored: true,
    });
    return User;
};