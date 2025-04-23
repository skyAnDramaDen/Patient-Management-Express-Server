const express = require("express");
const router = express.Router();

const { Doctor, Patient, Appointment, Schedule, User, Ward, Floor } = require('../models');
const sequelize = require("../db");

const checkRole = require("../middleware/checkRole");


router.get("/", checkRole(["super-admin"]), async (req, res) => {
    try {
        const floors = await Floor.findAll();

        return res.status(201).json(floors);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "There was an error fetching the floors.",
        });
    }
})

router.post("/create", checkRole(["super-admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();

    if (!req.body.floorName || !req.body.floorNumber) {
        throw new Error("There is no floorname and no floor number");
        return;
    }

    try {
        const floor = await Floor.create(req.body, { transaction });
        await transaction.commit();
        return res.status(201).json(floor);
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            success: false,
            message: "There was an error creating the floors.",
        });
    }
})

router.get("/get-floor-by/:id", checkRole(["super-admin"]), async (req, res) => {
    const id = req.params.id;

    try {
        const floor = await Floor.findOne({
            where: {
                id: id
            }
        })

        return res.status(201).json(floor);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not get floor"
        });
    }
})


router.get("/get-floor-wards-by/:id", checkRole(["super-admin"]), async (req, res) => {
    const id = req.params.id;

    try {
        const floor = await Floor.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Ward,
                    as: "wards",
                    required: false
                }
            ]
        })

        return res.status(201).json(floor);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not get floor's wards"
        });
    }
})

router.post('/delete/:id', checkRole(["super-admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();
    const { id } = req.params;
  
    try {
      const floor = await Floor.findByPk(id);
  
      if (!floor) {
        await transaction.rollback();
        return res.status(404).json({ message: "Floor not found" });
      }
  
      await floor.destroy({ transaction });
      await transaction.commit();
      return res.status(200).json({ message: "Floor deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            success: false,
            message: "There was an error deleting the floor"
        });
    }
  })

module.exports = router;