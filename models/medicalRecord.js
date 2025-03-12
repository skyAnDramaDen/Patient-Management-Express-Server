
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const MedicalRecord = sequelize.define(
    'medical_record', 
    {
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Patient',
            key: 'id'
        }
    },
    past_illnesses: {
        type: DataTypes.TEXT
    },
    surgeries: {
        type: DataTypes.TEXT
    },
    family_medical_history: {
        type: DataTypes.TEXT
    },
    allergies: {
        type: DataTypes.TEXT
    },
    current_medications: {
        type: DataTypes.TEXT
    },
    lifestyle_factors: {
        type: DataTypes.TEXT
    },
    treatment_plans: DataTypes.TEXT,
},
{ timestamps: true });

module.exports = MedicalRecord;