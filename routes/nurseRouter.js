const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User, Admission, Nurse } = require('../models');

const sequelize = require("../db");
const argon2 = require('argon2');

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
            const updatedNurse = await Nurse.findOne({ where: { id: id } });
            return res.status(200).json(updatedNurse);
        } else {
            throw new Error('Nurse not found');
        }
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update nurse' });
    }
});


module.exports = router;
