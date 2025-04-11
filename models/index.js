const sequelize = require('../db');
const User = require('./user'); 
const Doctor = require('./doctor');
const Patient = require('./patient');
const Appointment = require('./appointment'); 
const Schedule = require('./schedule');
const DoctorPatient = require('./doctorPAtient');
const MedicalRecord = require('./medicalRecord');
const Message = require("./message");
const Floor = require("./floor");
const Ward = require("./ward");
const Room = require("./room");
const Bed = require("./bed");
const Admission = require("./admission");
const Transfer = require("./transfer");
const WardAdmission = require("./wardAdmission");
const HospitalCharge = require("./hospitalCharge");
const BillingCategory = require("./billingCategory");
const BillingInformation = require("./billingInformation");
const ChargeBreakdown = require("./chargeBreakdown");

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

//below is the correct way
Patient.hasOne(MedicalRecord, { foreignKey: "patientId", as: 'medical_record' });
MedicalRecord.belongsTo(Patient, { foreignKey: "patientId", as: 'patient' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

Floor.hasMany(Ward, { foreignKey: 'floorId', as: "wards" });
Ward.belongsTo(Floor, { foreignKey: 'floorId', as: "floor" });

Ward.hasMany(Room, { foreignKey: 'wardId', as: "rooms" });
Room.belongsTo(Ward, { foreignKey: 'wardId', as: "ward" });

Room.hasMany(Bed, { foreignKey: 'roomId', as: "beds" });
Bed.belongsTo(Room, { foreignKey: 'roomId', as: "room" });

Patient.hasMany(Admission, { foreignKey: 'patientId', as: "admissions" });
Admission.belongsTo(Patient, { foreignKey: 'patientId', as: "admissionPatient" });

Admission.hasMany(Transfer, { foreignKey: 'admissionId', as: 'transfers' });
Transfer.belongsTo(Admission, { foreignKey: 'admissionId' });

Bed.hasMany(Transfer, { foreignKey: 'previousBedId', as: 'previousBeds' });
Bed.hasMany(Transfer, { foreignKey: 'currentBedId', as: 'currentBeds' });

Transfer.belongsTo(Bed, { foreignKey: 'previousBedId', as: 'previousBed' });
Transfer.belongsTo(Bed, { foreignKey: 'currentBedId', as: 'currentBed' });

Admission.hasMany(WardAdmission, { foreignKey: 'admissionId', as: 'wardAdmissions' });
WardAdmission.belongsTo(Admission, { foreignKey: 'admissionId', as: "admission" });

Ward.hasMany(WardAdmission, { foreignKey: 'wardId', as: 'wardAdmissions' });
WardAdmission.belongsTo(Ward, { foreignKey: 'wardId', as: "ward" });

Patient.hasMany(HospitalCharge, { foreignKey: 'patientId', as: 'charges' });
HospitalCharge.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Admission.hasMany(HospitalCharge, { foreignKey: 'admissionId', as: 'charges' });
HospitalCharge.belongsTo(Admission, { foreignKey: 'admissionId', as: 'admission' });

Patient.hasOne(BillingInformation, { foreignKey: "patientId", as: 'billing_information' });
BillingInformation.belongsTo(Patient, { foreignKey: "patientId", as: 'billing_information_patient' });

Patient.hasMany(ChargeBreakdown, { foreignKey: 'patientId', as: 'chargeBreakdowns' });
ChargeBreakdown.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

BillingCategory.hasMany(ChargeBreakdown, { foreignKey: 'billingCategoryId', as: 'chargeBreakdowns' });
ChargeBreakdown.belongsTo(BillingCategory, { foreignKey: 'billingCategoryId', as: 'billingCategory' });

Admission.hasMany(ChargeBreakdown, { foreignKey: 'admissionId', as: 'chargeBreakdowns' });
ChargeBreakdown.belongsTo(Admission, { foreignKey: 'admissionId', as: 'admission' });

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
    await Message.sync();
    await Floor.sync();
    await Room.sync();
    await Bed.sync();
    await Admission.sync();
    await Transfer.sync();
    await HospitalCharge.sync();
    await BillingCategory.sync();
    await BillingInformation.sync();
    await ChargeBreakdown.sync();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
})();

module.exports = { User, Doctor, Patient, DoctorPatient, Appointment, Schedule, MedicalRecord, Message, Ward, Floor, Room, Bed, Admission, Transfer, WardAdmission, HospitalCharge, BillingCategory, BillingInformation, ChargeBreakdown };