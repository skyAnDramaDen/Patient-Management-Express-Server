const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User, Admission, Nurse, PatientNurse } = require('../models');

const sequelize = require("../db");
const argon2 = require('argon2');
const { Op } = require('sequelize');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const checkRole = require("../middleware/checkRole");

router.get("/", checkRole(["admin", "super-admin"]), async (req, res) => {
    try {
        const nurses = await Nurse.findAll({
            include: [
                {
                    model: Schedule,
                    as: 'schedules',
                    required: false,
                },
            ]
        });

        if (!nurses) {
            return res.status(404).json({
                success: false,
                message: "Could not find any nurse data"
            })
        }

        return res.status(200).json({
            success: true,
            message: "The nurses data has been fetched",
            nurses: nurses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "There was an error fetching the nurses data"
        })
    }
})

router.post("/create", checkRole(["super-admin"]), async (req, res) => {
    const transaction = await sequelize.transaction();
    const { username, password, role } = req.body.user;

    try {
        const hashedPassword = await argon2.hash(password.trim());
        
        const user = await User.create({ username, password: hashedPassword, role }, { transaction });
        
        const nurseData = { ...req.body.nurse, userId: user.id };
        const nurse = await Nurse.create(nurseData, { transaction });

        await transaction.commit();

        return res.status(201).json(nurse);

    } catch (err) {
        console.log(err);
        await transaction.rollback();
        return res.status(500).json({ error: `Failed to create doctor${err}` });
    }
});

router.put('/nurse/update/:id', checkRole(["super-admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Nurse.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            console.log("Nurse has been updated");
            const updatedNurse = await Nurse.findOne({ where: { id: id } });
            return res.status(200).json(updatedNurse);
        } else {
            throw new Error('Nurse not found');
        }
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update nurse' });
    }
});

router.get("/get-nurses-by-name", checkRole(["super-admin", "admin"]), async (req, res) => {
    const { search } = req.query;
    try {
        const nurses = await Nurse.findAll({
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
            nurses: nurses,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({
            success: false,
            message: "There was an error fetching the nurses",
        })
    }
})

router.get("/nurse-schedule/:id", checkRole(["super-admin", "admin"]), async (req, res) => {
    const id = req.params.id;

    try {
        const nurse = await Nurse.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Schedule,
                    as: "schedules",
                }
            ]
        })

        return res.status(200).json({
            nurse: nurse
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "There was an error fetching the schedules."
        })
    }
})

router.get("/get-nurse-schedules/:id", checkRole(["super-admin", "admin", "nurse"]), async (req, res) => {
    const id = req.params.id;

    try {
        const nurse = await Nurse.findOne({
            where: {
                userId: id
            },
            include: [
                {
                    model: Schedule,
                    as: "schedules",
                    required: false,
                }
            ]
        })

        return res.status(200).json({
            nurse: nurse
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "There was an error fetching the schedules."
        })
    }
})

router.get("/get-nurse-schedules-by-id/:id", checkRole(["super-admin", "admit", "nurse"]), async (req, res) => {
    const id = req.params.id;

    try {
        const nurse = await Nurse.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Schedule,
                    as: "schedules",
                    required: false,
                }
            ]
        })

        return res.status(200).json(nurse)

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "There was an error fetching the schedules."
        })
    }
})

router.get("/get-nurse-assigned-patients/:id", checkRole(["super-admin", "admin", "nurse"]), async (req, res) => {
    const id = req.params.id;

    try {
        // const nurse = await Nurse.findOne({
        //     where: { id },
        //     include: [
        //         {
        //             model: PatientNurse,
        //             as: "patientNurse",
        //             required: true,
        //             include: [
        //                 {
        //                     model: Patient,
        //                     as: "patient"
        //                 },
        //                 {
        //                     model: Admission,
        //                     as: "admission",
        //                     where: {
        //                         status: "admitted"
        //                     }
        //                 }
        //             ]
        //         }
        //     ]
        // });

        const patients = await Patient.findAll({
            include: [
                {
                    model: PatientNurse,
                    as: "patientNurse",
                    where: {
                        nurseId: id,
                    },
                    required: true,
                    include: [
                        {
                            model: Admission,
                            as: "admission",
                            where: {
                                status: "admitted"
                            }
                        }
                    ]
                }
            ]
        })

        return res.status(200).json(patients);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "there was an error fetching the assigned patients"
        })
    }
})


module.exports = router;
