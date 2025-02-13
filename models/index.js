const sequelize = require('../db');
const User = require('./user'); 
const Doctor = require('./doctor');
const Patient = require('./patient');
const Appointment = require('./appointment'); 
const Schedule = require('./schedule');
const DoctorPatient = require('./doctorPAtient');

Doctor.belongsToMany(Patient, { through: 'DoctorPatient' });
Patient.belongsToMany(Doctor, { through: 'DoctorPatient' });


User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Patient, { foreignKey: 'userId' });
Patient.belongsTo(User, { foreignKey: 'userId' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

Doctor.hasMany(Schedule, { foreignKey: 'doctorId', as: "schedules" });
Schedule.belongsTo(Doctor, { foreignKey: 'doctorId' });


(async () => {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }); // Disable foreign key checks
    await User.sync();
    await Doctor.sync();
    await Patient.sync();
    await DoctorPatient.sync(); // Ensure the junction table is created after doctors and patients
    await Appointment.sync();
    await Schedule.sync();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true }); // Re-enable foreign key checks
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
})();

module.exports = { User, Doctor, Patient, Appointment, Schedule };