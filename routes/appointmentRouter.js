const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User } = require('../models');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                {
                    model: Doctor,
                    as: 'doctor',
                    required: true,
                },
                {
                    model: Patient,
                    as: 'patient',
                    required: true
                }
            ]
        });

        res.status(201).json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
})

router.post("/create", async (req, res) => {
    try {
        const created_appointment = await Appointment.create(req.body);

        res.status(201).json(created_appointment);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

router.get("/doctor-appointment/:id", async (req, res) => {
    const doctor_id = req.params.id;
    
})

module.exports = router;