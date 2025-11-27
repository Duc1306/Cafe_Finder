'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            // Có thể thêm quan hệ nếu muốn biết thông báo liên quan đến User/Cafe nào
        }
    }
    Notification.init({
        type: DataTypes.ENUM('NEW_USER', 'NEW_CAFE', 'REPORT', 'SYSTEM'),
        title: DataTypes.STRING,
        content: DataTypes.TEXT,
        is_read: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        underscored: true,
    });
    return Notification;
};