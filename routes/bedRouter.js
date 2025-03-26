const express = require("express");
const router = express.Router();

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed } = require('../models');

router.get("/", async (req, res) => {
    console.log("someone is tryiing to get the beds");
    try {
        const beds = Bed.findAll();

        res.status(201).json(beds);
    } catch (error) {
        console.log(error);
    }
})

router.post("/create", async (req, res) => {
    const { bed, roomId } = req.body;

    const room = await Room.findOne({
        where: { id: roomId },
        include: [
            {
                model: Bed,
                as: "beds",
                required: false
            }
        ]
    });

    let words = room.name.split(" ").filter(word => word.toLowerCase() !== "the");
    
    let abbr = "";
    if (words.length > 1) {
        for (let x = 0; x < 2; x++) {
            abbr += words[x][0];
        }
    } else {
        abbr = words[0].slice(0, 3);
    }

    abbr += (room.beds.length + 1);
    abbr = abbr.toUpperCase();

    const bed_ = Bed.findOne({
        where: {
            bedNumber: abbr
        }
    });

    if (bed_) {
        abbr = words[0].slice(0, 3);
        abbr += (room.beds.length + 1);
    abbr = abbr.toUpperCase();
    }

    const bed_data = {
        bedNumber: abbr,
        type: bed.type,
        status: bed.status,
        roomId: roomId
    }
    
    try {
        const bed = await Bed.create(bed_data);
        res.status(201).json(bed);
    } catch (error) {
        console.log(error);
    }
});

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const bed = await Bed.findByPk(id);
  
      if (!bed) {
        return res.status(404).json({ message: "Bed not found" });
      }

      await bed.destroy();
      res.status(200).json({ message: "Bed deleted successfully" });
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-beds-by-room/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);

    try {
        const room = await Room.findOne({
            where: { id: id },
            include: [
                {
                    model: Bed,
                    as: "beds",
                    required: false,
                }
            ]
        })

        res.status(201).json(room);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;