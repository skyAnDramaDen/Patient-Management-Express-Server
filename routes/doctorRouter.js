const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User } = require('../models');
const { Op } = require('sequelize');

const sequelize = require('../db');

const argon2 = require('argon2');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const checkRole = require("../middleware/checkRole");

router.get('/', checkRole(["super-admin", "admin"]), async (req, res) => {
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

        return res.status(201).json(doctors);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

router.post("/create", checkRole(["super-admin"]), async (req, res) => {
    const transaction = await sequelize.transaction();
    const { username, password, role } = req.body.user;

    try {
        const hashedPassword = await argon2.hash(password.trim());
        
        const user = await User.create({ username, password: hashedPassword, role }, { transaction });
        
        const doctorData = { ...req.body.doctor, userId: user.id };
        const doctor = await Doctor.create(doctorData, { transaction });

        await transaction.commit();

        return res.status(201).json(doctor);

    } catch (err) {
        await transaction.rollback();
        return res.status(500).json({ error: `Failed to create doctor${err}` });
    }
});

router.put('/doctor/update/:id', checkRole(["super-admin"]), async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const [updated] = await Doctor.update(req.body, {
            where: { id: id },
            transaction,
        });

        if (updated) {
            const updatedDoctor = await Doctor.findOne({ where: { id: id } });
            await transaction.commit();
            return res.status(200).json(updatedDoctor);
        } else {
            await transaction.rollback();
            throw new Error('Doctor not found');
        }
    } catch (err) {
        await transaction.rollback();
        return res.status(500).json({ error: 'Failed to update patient' });
    }
});

router.post('/delete/:id', checkRole(["super-admin"]), async (req, res) => {
    const transaction = await sequelize.transaction();
    const { id } = req.params;
  
    try {
      const doctor = await Doctor.findByPk(id);
  
      if (!doctor) {
        await transaction.rollback();
        return res.status(404).json({ message: "Doctor not found" });
      }
  
      await doctor.destroy({ transaction });
      await transaction.commit();
      return res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (err) {
        await transaction.rollback();
        return res.status(200).json({
            success: false,
            message: "Doctor was not deleted successfully"
        });
    }
})


router.get("/doctor-schedule/:id", checkRole(["super-admin"]), async (req, res) => {
    const id = req.params.id;

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

        return res.status(201).json(doctor.toJSON());
    } catch (error) {
        return res.status(501).json({
            message: "there has been an error"
        })
    }


})


router.get("/doctor-appointments/:id", checkRole(["super-admin", "doctor"]), async (req, res) => {
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
                    where: {
                        // status: "scheduled"
                    },
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

        return res.status(201).json(doctor);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch doctor appointments' });
    }
});

router.get("/scheduled-for/:date", checkRole(["super-admin", "admin"]), async (req, res) => {
    const date = req.params.date;

    const formattedDate = new Date(date).toISOString().split("T")[0]; 

    const doctors = await Doctor.findAll({
        include: [
          {
            model: Schedule,
            as: 'schedules',
            where: { date: formattedDate },
            required: true
          }
        ]
    });

    return res.status(201).json(doctors);
})

router.get("/get-doctors-by-name", checkRole(["super-admin", "admin"]), async (req, res) => {
    const search = req.query.search;
    try {
        const doctors = await Doctor.findAll({
            where: {
				[Op.or]: [
					{
						firstName: {
							[Op.like]: `%${search}%`,
						},
					},
					{
						lastName: {
							[Op.like]: `%${search}%`,
						},
					},
				],
			},
            include: [
                {
                    model: Schedule,
                    as: "schedules",
                }
            ]
        })

        return res.status(200).json({
            success: true,
            doctors: doctors,
        });
    }
    catch (error) {
        return res.status(200).json({
            success: false,
            message: "There was an error fetching the doctors",
        })
    }
})

module.exports = router;