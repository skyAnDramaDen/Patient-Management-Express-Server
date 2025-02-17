const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User } = require('../models');

const sequelize = require('../db');

const argon2 = require('argon2');
const saltRounds = 10;

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
    // console.log("ResponseResponseResponseResponseResponseResponseResponseResponseResponse");
    // const query = `
    //     SELECT *
    //     FROM doctors 
    //     LEFT JOIN schedules
    //     ON doctors.id = schedules.doctorId;
    // `;

    // sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
    // .then(results => {
    //     console.log(results);
    //     // res.json(results);
    // })
    // .catch(error => {
    //     console.error('Error executing query:', error);
    //     res.status(500).json({ error: 'Failed to fetch doctors' });
    // });
    try {
        const doctors = await Doctor.findAll({
            include: [
                {
                    model: Schedule,
                    as: 'schedules',
                    required: false,
                }
            ]
        });
        
        // console.log(doctors);
        res.json(doctors);
    } catch (error) {
        // console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

router.post("/create", async (req, res) => {
    const { username, password, role } = req.body.user;

    try {
        const hashedPassword = await argon2.hash(password.trim());
        
        const user = await User.create({ username, password: hashedPassword, role });
        
        const doctorData = { ...req.body.doctor, userId: user.id };
        const doctor = await Doctor.create(doctorData);

        res.status(201).json(doctor);

    } catch (err) {
        // console.error('Failed to create doctor:', err);
        res.status(500).json({ error: 'Failed to create doctor' });
    }
});


router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const doctor = await Doctor.findByPk(id);
  
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
  
      await doctor.destroy();
      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (err) {
  
    }
  })

module.exports = router;