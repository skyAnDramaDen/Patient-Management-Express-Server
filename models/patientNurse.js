const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const PatientNurse = sequelize.define(
	"patient_nurse",
	{
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		patientId: {
			allowNull: false,
			type: DataTypes.INTEGER,
			references: {
			  model: 'Patients',
			  key: 'id'
			}
		},
		nurseId: {
			allowNull: false,
			type: DataTypes.INTEGER,
			references: {
			  model: 'nurses',
			  key: 'id'
			}
		},
		admissionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'admissions',
                key: 'id',
            },
        },
	},
	{ timestamps: true }
);

module.exports = PatientNurse;
