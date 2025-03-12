const express = require('express');
const router = express.Router();

const { Doctor, Patient, Appointment, Schedule, User, Message } = require('../models');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/send', async (req, res) => {
    try {
      const { senderId, receiverId, content } = req.body;
  
      
      const sender = await User.findByPk(senderId);
      const receiver = await User.findByPk(receiverId);
  
      if (!sender || !receiver) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const message = await Message.create({ senderId, receiverId, content });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
});
  
module.exports = router;