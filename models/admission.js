const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Appointment = require('./appointment');

const Admission = sequelize.define(
    'admission',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        bedId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'beds',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'patients',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        admissionDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        dischargeDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        reasonForAdmission: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('admitted', 'discharged', 'transferred'),
            allowNull: false,
            defaultValue: 'admitted',
        },
    },
    { timestamps: true }
);

module.exports = Admission;