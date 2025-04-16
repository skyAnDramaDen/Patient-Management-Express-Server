const express = require("express");
const router = express.Router();

const { Doctor, Patient, Appointment, Schedule, User, Ward, Floor } = require('../models');

const checkRole = require("../middleware/checkRole");


router.get("/", checkRole(["super-admin"]), async (req, res) => {
    console.log("someone is tryiing to get the wards");
    try {
        const floors = await Floor.findAll();

        console.log(floors);

        res.status(201).json(floors);
    } catch (error) {
        console.log(error);
    }
})

router.post("/create", checkRole(["super-admin"]), async (req, res) => {
    console.log(req.body);

    if (!req.body.floorName || !req.body.floorNumber) {
        throw new Error("There is no floorname and no floor number");
        return;
    }

    try {
        const floor = await Floor.create(req.body);
        res.status(201).json(floor);
    } catch (error) {
        console.log(error);
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

        res.status(201).json(floor);
    } catch (error) {
        console.log(error);
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

        console.log()

        res.status(201).json(floor);
    } catch (error) {
        console.log(error);
    }
})

router.post('/delete/:id', checkRole(["super-admin"]), async (req, res) => {
    const { id } = req.params;
  
    try {
      const floor = await Floor.findByPk(id);
  
      if (!floor) {
        return res.status(404).json({ message: "Floor not found" });
      }
  
      await floor.destroy();
      res.status(200).json({ message: "Floor deleted successfully" });
    } catch (error) {
        console.log(error);
    }
  })

module.exports = router;