const express = require("express");
const router = express.Router();

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed } = require('../models');

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
});

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const ward = await Ward.findByPk(id);
  
      if (!ward) {
        return res.status(404).json({ message: "Ward not found" });
      }
  
      await ward.destroy();
      res.status(200).json({ message: "Ward deleted successfully" });
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-ward-rooms-by/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);

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
                }
            ]
        })

        res.status(201).json(ward);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;