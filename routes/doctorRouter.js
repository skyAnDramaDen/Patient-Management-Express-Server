const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User } = require('../models');
const { Op } = require('sequelize');

const sequelize = require('../db');

const argon2 = require('argon2');
const saltRounds = 10;

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
    console.log("im here now right abobut now rhen");
    
    try {
        const doctors = await Doctor.findAll({
            //in the associations below, for some reason, if i include the appointment after the 
            //schedule i do not get the appintments joined to the doctor. find out why
            include: [
                {
                    model: Appointment,
                    as: 'appointments',
                    required: false,
                    include: [
                        {
                            model: Patient,
                            as: "patient",
                            required: false,
                        }
                    ]
                },
                {
                    model: Schedule,
                    as: 'schedules',
                    required: false,
                },
            ]
        });

        res.status(201).json(doctors);
    } catch (error) {
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
        res.status(500).json({ error: `Failed to create doctor${err}` });
    }
});

router.put('/doctor/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Doctor.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            const updatedDoctor = await Doctor.findOne({ where: { id: id } });
            res.status(200).json(updatedDoctor);
        } else {
            throw new Error('Doctor not found');
        }
    } catch (err) {
        console.error('Failed to update patient:', err);
        res.status(500).json({ error: 'Failed to update patient' });
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


router.get("/doctor-schedule/:id", async (req, res) => {
    const id = req.params.id;

    console.log("jkwnfiunefuinfni fiunei vffeijnc ienfviencfine icfincinfi cfinfiue4n");
    console.log(id);
    try {
        const doctor = await Doctor.findOne({
            where: { id: id },
            include: [
                {
                    model: Schedule,
                    as: 'schedules',
                    required: false
                },
                {
                    model: Appointment,
                    as: 'appointments',
                    required: false,
                    include: [
                        {
                            model: Patient,
                            as: "patient",
                            required: false,
                        }
                    ]
                }
                
            ]
        });

        // const doctorJson = doctor.get({ plain: true });


        console.log(doctor.toJSON());

        res.status(201).json(doctor.toJSON());
    } catch (error) {
        console.log(error);
    }


})


router.get("/doctor-appointments/:id", async (req, res) => {
    const id = req.params.id;

    const today = new Date();
    
    try {
        // const appointments = await Appointment.findAll({ 
        //     where: { 
        //         doctorId: id,
                // date: {
                //     [Op.gte]: today
                // }
        //     } 
        // });


        //below is for with the date starting today onwards

        // const doctor = await Doctor.findByPk(id, {
        //     include: [
        //       {
        //         model: Appointment,
        //         as: 'Appointments',
        //         required: false,
        //         where: {
        //             date: {
        //                 [Op.gte]: today
        //             }
        //         }
        //       }
        //     ]
        // });
        const user = await User.findByPk(id);

        const doctor = await Doctor.findOne({
            where: { userId: id },
            include: [
                {
                    model: Appointment,
                    as: 'appointments',
                    required: false,
                    include: [
                        {
                            model: Patient,
                            as: "patient",
                            required: false,
                        }
                    ]
                }
            ]
        });
        
        // console.log(doctor);

        res.status(201).json(doctor);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch doctor appointments' });
    }
});

router.get("/scheduled-for/:date", async (req, res) => {
    const date = req.params.date;
    console.log(date);

    // const schedules = await Schedule.findAll({
    //     where: { date: date },
    //     include: [
    //       {
    //         model: Doctor,
    //         as: 'Doctor',
    //         required: false,
    //       }
    //     ]
    // });

    const doctors = await Doctor.findAll({
        include: [
          {
            model: Schedule,
            as: 'schedules',
            where: { date: date },
            required: true
          }
        ]
    });
      
    console.log(doctors);
      
    res.status(201).json(doctors);
})

module.exports = router;