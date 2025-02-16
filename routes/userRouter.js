const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');

const argon2 = require('argon2');

const { Doctor, Patient, Appointment, Schedule, User } = require('../models');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.post('/create', async (req, res) => {
    const { username, password, role } = req.body;
  
    try {
      // const hashedPassword = await bcrypt.hash(password, 10);
      // const hashedPassword = await bcrypt.hash(password.trim(), 10);
      const hashedPassword = await argon2.hash(password.trim());

      const allowedRoles = ["doctor", "nurse", "admin", "super-admin", "patients"];
      // const isPasswordValid = await bcrypt.compare(password, hashedPassword);

      // console.log(isPasswordValid);
      console.log(hashedPassword);
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      let user = await User.findOne({ where: { username } });

      if (user) {
        // res.send("a user with this username exists already");
        throw new Error("A user with this username exists already.");
      }

      const isPasswordValid = await argon2.verify(hashedPassword.trim(), password.trim());

      console.log(isPasswordValid);
      console.log(hashedPassword + " @")
      console.log(password + " @")

      user = await User.create({ username, password: hashedPassword.trim(), role });
      res.status(201).json({ message: "User registered successfully", user });
    
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Server Error');
    }
});

router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  try {
    let user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) {
      user.username = username;
    }
    if (password) {
      user.password = await bcrypt.hash(password.trim(), 10);
    }
    if (role) {
      const allowedRoles = ["doctor", "nurse", "admin", "super-admin", "patients"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;