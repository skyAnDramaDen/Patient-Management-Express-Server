const express = require("express");
const router = express.Router();

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room } = require('../models');

router.get("/", async (req, res) => {
    try {
        const rooms = Room.findAll();

        return res.status(201).json(rooms);
    } catch (error) {
        return res.status(500).json(error);
    }
})

router.post("/create", async (req, res) => {

    try {
        const room = await Room.create(req.body);
        return res.status(201).json(room);
    } catch (error) {
        const error_message = error.errors[0].type + ": " + error.errors[0].message;
        res.status(500).json({
            error: error_message,
        });
    }
});

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const room = await Room.findByPk(id);
  
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
  
      await room.destroy();
      res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;