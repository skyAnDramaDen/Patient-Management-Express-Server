const Doctor = require('./doctor');
const Patient = require('./patient');
const Appointment = require('./appointment');
const ScheduleModel = require('./schedule');

const { DataTypes } = require('sequelize');

const sequelize = require('../db');
const Schedule = ScheduleModel(sequelize, DataTypes);

// Define the many-to-many relationship
Doctor.belongsToMany(Patient, { through: 'DoctorPatient' });
Patient.belongsToMany(Doctor, { through: 'DoctorPatient' });

// Define one-to-many relationships
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Doctor.hasMany(Schedule, { foreignKey: 'doctorId' });
Schedule.belongsTo(Doctor, { foreignKey: 'doctorId' });

sequelize.sync({ alter: true }) // Use `alter: true` during development
    .then(() => console.log('✅ Database synced'))
    .catch(err => console.error('❌ Error syncing database:', err));

module.exports = { Patient, Doctor, Appointment, Schedule };
