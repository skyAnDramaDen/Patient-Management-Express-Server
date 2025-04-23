const express = require("express");
const router = express.Router();
const sequelize = require("../db");

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed } = require('../models');

const checkRole = require("../middleware/checkRole");


router.get("/", checkRole(["super-admin"]), async (req, res) => {
    try {
        const beds = Bed.findAll();

        return res.status(201).json(beds);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "The beds were not fetched successfully"
        });
    }
})

router.post("/create", checkRole(["super-admin"]), async (req, res) => {
    const transaction = await sequelize.transaction();
    const { bed, roomId } = req.body;

    const room = await Room.findOne({
        where: { id: roomId },
        include: [
            {
                model: Bed,
                as: "beds",
                required: false
            }
        ],
        transaction,
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
        const bed = await Bed.create(bed_data, { transaction });
        await transaction.commit();
        return res.status(201).json(bed);
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            success: false,
            message: "Bed was not created successfully"
        });
    }
});

router.post('/delete/:id', checkRole(["super-admin"]), async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();
  
    try {
      const bed = await Bed.findByPk(id);
  
      if (!bed) {
        await transaction.rollback();
        return res.status(404).json({ message: "Bed not found" });
      }

      await bed.destroy({ transaction });
      await transaction.commit();

      return res.status(200).json({ message: "Bed deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            success: false,
            message: "Bed was not deleted successfully",
        });
    }
})

router.get("/get-beds-by-room/:id", checkRole(["super-admin"]), async (req, res) => {
    const id = req.params.id;

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

        return res.status(201).json(room);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "The rooms were not fetched successfully"
        });
    }
})

module.exports = router;