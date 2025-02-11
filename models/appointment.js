const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Patient = require('./patient');
const Doctor = require('./doctor');

const Appointment = sequelize.define('Appointment', {
    appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Patient,
            key: 'id'
        }
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Doctor,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Scheduled' // Possible values: 'Scheduled', 'Completed', 'Cancelled', etc.
    },
    scheduleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Schedules',  // Make sure the reference matches the model name
            key: 'id'
        }
    }
});

module.exports = Appointment;