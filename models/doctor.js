const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Doctor = sequelize.define(
    'Doctor',
    {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        middleName: {
            type: DataTypes.STRING,
            allowNull: true
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
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: [/^\+?[0-9\s\-()]+$/i] // Allows +, spaces, dashes, and parentheses
            }
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
        specialization: {
            type: DataTypes.STRING,
            allowNull: false
        },
        medicalLicenseNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        yearsOfExperience: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        education: {
            type: DataTypes.STRING,
            allowNull: true
        },
        certifications: {
            type: DataTypes.STRING,
            allowNull: true
        },
        hospitalAffiliations: {
            type: DataTypes.STRING,
            allowNull: true
        },
        languagesSpoken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        biography: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    { timestamps: true } // Enables createdAt & updatedAt
);

module.exports = Doctor;