const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const HospitalCharge = sequelize.define(
    'hospitalCharge',
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
                model: "Patients",
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "BillingCategory",
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        appointmentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'appointments',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        admissionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'admissions',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ratePerUnit: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        totalCharge: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
    },
    { timestamps: true },
    
);

module.exports = HospitalCharge;