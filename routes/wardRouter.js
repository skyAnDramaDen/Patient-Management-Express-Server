const express = require("express");
const router = express.Router();

const { Doctor, Patient, Appointment, Schedule, User, Ward } = require('../models');

router.get("/", async (req, res) => {
    console.log("someone is tryiing to get the wards");
    try {
        const wards = Ward.findAll();

        res.status(201).json(wards);
    } catch (error) {
        console.log(error);
    }
})

router.post("/create", async (req, res) => {
    console.log(req.body);

    try {
        const ward = await Ward.create(req.body);
        res.status(201).json(ward);
    } catch (error) {
        console.log(error);
    }


})

module.exports = router;