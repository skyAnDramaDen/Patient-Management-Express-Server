const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const DoctorPatient = sequelize.define('doctor_patient', {
  
}, {
  timestamps: false // This table is just for the relationship, no need for timestamps
});

module.exports = DoctorPatient;
