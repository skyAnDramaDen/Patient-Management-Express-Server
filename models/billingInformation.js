const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const BillingInformation = sequelize.define(
    'billing_information',
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
                model: 'Patients',
                key: 'id',
            },
        },
        billingAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        paymentMethodId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customerId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        insuranceProvider: {
            type: DataTypes.STRING,
        },
        policyNumber: {
            type: DataTypes.STRING,
        },
    },
    { timestamps: true }
);

module.exports = BillingInformation;
