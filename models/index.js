const sequelize = require('../db');
const User = require('./user'); 
const Doctor = require('./doctor');
const Patient = require('./patient');
const Appointment = require('./appointment'); 
const Schedule = require('./schedule');
const DoctorPatient = require('./doctorPAtient');
const MedicalRecord = require('./medicalRecord');

Doctor.belongsToMany(Patient, { through: 'DoctorPatient' });
Patient.belongsToMany(Doctor, { through: 'DoctorPatient' });

User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Patient, { foreignKey: 'userId' });
Patient.belongsTo(User, { foreignKey: 'userId' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: "appointments" });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: "doctor" });

Patient.hasMany(Appointment, { foreignKey: 'patientId', as: "appointments" });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: "patient" });

Doctor.hasMany(Schedule, { foreignKey: 'doctorId', as: "schedules" });
Schedule.belongsTo(Doctor, { foreignKey: 'doctorId', as: "appointments" });

Patient.hasOne(MedicalRecord, { foreignKey: "patientId" })
MedicalRecord.belongsTo(Patient, { foreignKey: "patientId" })
console.log(MedicalRecord);

(async () => {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await User.sync();
    await Doctor.sync();
    await Patient.sync();
    await DoctorPatient.sync();
    await Appointment.sync();
    await Schedule.sync();
    await MedicalRecord.sync();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
})();

module.exports = { User, Doctor, Patient, Appointment, Schedule, MedicalRecord };