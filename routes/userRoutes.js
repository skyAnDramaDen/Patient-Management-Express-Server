const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
// const Doctor = require("../models/doctor");
// const Schedule = require("../models/schedule");
const { Doctor, Patient, Appointment, Schedule } = require('../models');

console.log(Schedule);


const sequelize = require('../db');



router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashedPassword, role });
  
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Server Error');
    }
  });