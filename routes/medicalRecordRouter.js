const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User, MedicalRecord } = require('../models');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
    console.log("the very southern personn you met");
    try {
        const medical_records = await MedicalRecord.findAll();
        console.log(medical_records);

        res.status(201).json(medical_records);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch medical records' });
    }
})