const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const WardAdmission = sequelize.define(
    'wardAdmission',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        admissionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'admissions', 
                key: 'id',
            },
            onDelete: 'CASCADE', 
        },
        wardId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'wards', 
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        transferDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    { timestamps: true }
);

module.exports = WardAdmission;
