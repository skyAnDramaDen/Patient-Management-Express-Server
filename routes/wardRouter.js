const express = require("express");
const router = express.Router();
const sequelize = require("../db");

const checkRole = require("../middleware/checkRole");

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed, Floor } = require('../models');

router.get("/", checkRole(["super-admin"]), async (req, res) => {
    try {
        const wards = Ward.findAll();

        return res.status(201).json(wards);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "There was an error fetching the wards."
        });
    }
})

router.post("/create", checkRole(["super-admin"]), async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const ward = await Ward.create(req.body, { transaction });
        transaction.commit();
        res.status(201).json(ward);
    } catch (error) {
        transaction.rollback();
        return res.status(500).json({
            success: false,
            message: "There was an error creating the wards."
        });
    }
});

router.post('/delete/:id', checkRole(["super-admin"]), async (req, res) => {
    const transaction = await sequelize.transaction();
    const { id } = req.params;
  
    try {
      const ward = await Ward.findByPk(id, { transaction });
  
      if (!ward) {
        transaction.rollback();
        return res.status(404).json({ message: "Ward not found" });
      }
  
      await ward.destroy({ transaction });
      return res.status(200).json({ message: "Ward deleted successfully" });
    } catch (error) {
        transaction.rollback();
        return res.status(500).json({
            success: false,
            message: "There was an error deleting the wards."
        });
    }
})

router.get("/get-ward-rooms-by/:id", checkRole(["super-admin"]), async (req, res) => {
    const id = req.params.id;

    try {
        const ward = await Ward.findOne({
            where: { id: id },
            include: [
                {
                    model: Room,
                    as: "rooms",
                    required: false,
                    include: [
                        {
                            model: Bed,
                            as: "beds",
                            required: false
                        }
                    ]
                },
                {
                    model: Floor,
                    as: "floor",
                    required: true,
                }
            ]
        })

        return res.status(201).json(ward);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "There was an error getting the ward's rooms."
        });
    }
})

module.exports = router;