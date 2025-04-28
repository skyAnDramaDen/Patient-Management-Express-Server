const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Vital = sequelize.define(
    'vital', {
    id: { 
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id'
        }
    },
    nurseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Nurses',
          key: 'id'
        }
    },
    temperature: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    bloodPressure: {
        type: DataTypes.STRING,
        allowNull: false
    },
    heartRate: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    respiratoryRate: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    oxygenSaturation: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    recordedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Vital;
