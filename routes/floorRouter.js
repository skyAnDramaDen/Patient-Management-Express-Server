const express = require("express");
const router = express.Router();

const { Doctor, Patient, Appointment, Schedule, User, Ward, Floor } = require('../models');

router.get("/", async (req, res) => {
    console.log("someone is tryiing to get the wards");
    try {
        const floors = await Floor.findAll();

        console.log(floors);

        res.status(201).json(floors);
    } catch (error) {
        console.log(error);
    }
})

router.post("/create", async (req, res) => {
    console.log(req.body);

    try {
        const floor = await Floor.create(req.body);
        res.status(201).json(floor);
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-floor-by/:id", async (req, res) => {
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


router.get("/get-floor-wards-by/:id", async (req, res) => {
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

        res.status(201).json(floor);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;