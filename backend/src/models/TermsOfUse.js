'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TermsOfUse extends Model {
        static associate(models) {
            TermsOfUse.hasMany(models.User, { foreignKey: 'agreed_terms_id' });
        }
    }
    TermsOfUse.init({
        version: DataTypes.STRING,
        content: DataTypes.TEXT,
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'TermsOfUse',
        tableName: 'termsOfUses',
        underscored: true,
    });
    return TermsOfUse;
};