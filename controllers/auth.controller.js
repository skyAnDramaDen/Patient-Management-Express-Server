const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const argon2 = require('argon2');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // const isPasswordValid = await bcrypt.compare(password.trim(), user.password);
    // const isPasswordValid = password.trim() == user.password;

    const isPasswordValid = await argon2.verify(user.password.trim(), password.trim());
    
    console.log("@" + password + "@");
    // console.log(password.trim() + "@");
    // console.log(user.password + "@");
    console.log("@" + user.password + "@");
    console.log(isPasswordValid, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials 22222' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username },  // Payload (you can add more info here)
      JWT_SECRET,                           // Secret key for signing the token
      { expiresIn: '1h' }                   // Expiration time (optional)
    );

    // Respond with the token and user info (optional)
    // res.json({
    //   message: 'Login successful',
    //   token,
    //   user: {
    //     id: user.id,
    //     username: user.username,
    //     role: user.role,
    //   }
    // });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
