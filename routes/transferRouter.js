const express = require("express");
const router = express.Router();
const { Op } = require('sequelize');

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed, Admission, Transfer } = require('../models');

router.get("/", async (req, res) => {
    console.log("someone is tryiing to get the transfers");
    try {
        const transfer = Transfer.findAll();

        res.status(201).json(transfer);
    } catch (error) {
        console.log(error);
    }
})

router.post("/create", async (req, res) => {
    console.log(req.body);

    try {
        const transfer = await Transfer.create(req.body);
        res.status(201).json(transfer);
    } catch (error) {
        console.log(error);
        res.status(501).json(error);
    }
});

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const transfer = await Transfer.findByPk(id);
  
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }
  
      await transfer.destroy();
      res.status(200).json({ message: "Transfer deleted successfully" });
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-transfer-by/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);

    try {
        const transfer = await Transfer.findOne({
            where: { id: id },
            // include: [
            //     {
            //         model: Patient,
            //         as: "admissionPatient",
            //         required: false,
            //         // include: [
            //         //     {
            //         //         model: Bed,
            //         //         as: "beds",
            //         //         required: false
            //         //     }
            //         // ]
            //     }
            // ]
        })

        res.status(201).json(transfer);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;