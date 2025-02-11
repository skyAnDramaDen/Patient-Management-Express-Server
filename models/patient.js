const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Patient = sequelize.define('Patient', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    addressLine1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    addressLine2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postalCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    medicalHistory: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    allergies: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    currentMedications: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    emergencyContactName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    emergencyContactPhone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    primaryCarePhysician: {
        type: DataTypes.STRING,
        allowNull: true
    },
    insuranceProvider: {
        type: DataTypes.STRING,
        allowNull: true
    },
    insurancePolicyNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    occupation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    maritalStatus: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bloodType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    height: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = Patient;