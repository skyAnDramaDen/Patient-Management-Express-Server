const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const BillingCategory = sequelize.define(
    'billingCategory', 
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        retrievalName: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'defaultRetrievalName',
        },
        group: {
            type: DataTypes.ENUM('admission_fees', 'consultation_fees', 'ward_charges', 'miscellaneous'),
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
        
    },
    { timestamps: true }
);

module.exports = BillingCategory;