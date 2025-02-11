const express = require('express');
const router = express.Router();
const Patient = require("../models/patient");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Define the home route
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.findAll();
        console.log(patients);
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

router.post("/create", async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const patient = await Patient.create(req.body);
        res.status(201).json(patient);
    } catch (err) {
        console.error('Failed to create patient:', err);
        res.status(500).json({ error: 'Failed to create patient' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Patient.update(req.body, {
            where: { id: id }
        });
        if (updated) {
            const updatedPatient = await Patient.findOne({ where: { id: id } });
            res.status(200).json(updatedPatient);
        } else {
            throw new Error('Patient not found');
        }
    } catch (err) {
        console.error('Failed to update patient:', err);
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

module.exports = router;