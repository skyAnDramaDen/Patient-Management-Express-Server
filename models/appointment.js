const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Appointment = sequelize.define('appointment', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  patientId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: 'Patients',
      key: 'id'
    }
  },
  doctorId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Appointment;