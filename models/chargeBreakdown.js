const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ChargeBreakdown = sequelize.define(
    'charge_breakdown',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'patients',
                key: 'id'
            }
        },
        admissionId : {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'admissions',
                key: 'id'
            } 
        },
        billingCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'billingCategories',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        totalCost: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: 0.00
        }
    },
    { timestamps: true }
);

module.exports = ChargeBreakdown;
