const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Schedule = sequelize.define('schedule', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  doctorId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  nurseId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Nurses',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('available', 'unavailable', 'booked'),
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Schedule;