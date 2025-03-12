const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { Doctor, Patient, Appointment, Schedule, User, MedicalRecord } = require('../models');

const argon2 = require('argon2');
const saltRounds = 10;

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
  console.log(req.user);
    try {
        const patients = await Patient.findAll();
        // console.log(patients);
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

router.post("/create", async (req, res) => {
    const { username, password, role } = req.body.user;

    console.log(req.body);

    try {
        const hashedPassword = await argon2.hash(password.trim());
        const user = await User.create({ username, password: hashedPassword, role });
        console.log('Request Body:', req.body);

        const patientData = { ...req.body.patient, userId: user.id };
        const patient = await Patient.create(patientData);

        const medicalRecord = await MedicalRecord.create({ patientId: patient.id });
        console.log('Medical Record Created:', medicalRecord);

        res.status(201).json(patient);
    } catch (err) {
        console.error('Failed to create patient:', err);
        res.status(500).json(err);
    }
});

router.get('/get-patients-by-name', async (req, res) => {
    console.log("im being visited herer");
    const { search } = req.query;
  
    try {
      const patients = await Patient.findAll({
        where: {
          [Op.or]: [
            {
              firstName: {
                  [Op.like]: `%${search}%`
              }
            },
            {
                lastName: {
                    [Op.like]: `%${search}%`
                }
            }
          ]
        }
      });
  
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).send('Server Error');
    }
});

router.put('/edit/:id', async (req, res) => {
  console.log('whats gotta be goung on here for a ehile');
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

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const patient = await Patient.findByPk(id);
  
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      await patient.destroy();
      res.status(200).json({ message: "Patient deleted successfully" });
    } catch (err) {
  
    }
})

module.exports = router;