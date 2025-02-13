const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Doctor, Patient, Appointment, Schedule, User } = require('../models');

console.log(Schedule);

const sequelize = require('../db');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const allowedRoles = ["doctor", "nurse", "admin", "superadmin", "patients"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

    const user = await User.create({ username, email, password, role });
    res.status(201).json({ message: "User registered successfully", user });
  
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Server Error');
    }
  });

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Prevent unauthorized role assignment
    

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
