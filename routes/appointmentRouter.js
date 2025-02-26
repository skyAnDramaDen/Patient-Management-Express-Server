const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User } = require('../models');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
    console.log("im getting to this point right now");
    try {
        const appointments = await Appointment.findAll({
            include: [
                {
                    model: Doctor,
                    as: 'Doctor',
                    required: true,
                },
                {
                    model: Patient,
                    as: 'Patient',
                    required: true
                }
            ]
        });
        console.log("appointmentsorder up");

        res.status(201).json(appointments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
})

router.post("/create", async (req, res) => {
    console.log(req.body);
    try {
        const created_appointment = await Appointment.create(req.body);

        console.log(created_appointment);

        res.status(201).json(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

router.get("/doctor-appointment/:id", async (req, res) => {
    const doctor_id = req.params.id;
    
})

module.exports = router;