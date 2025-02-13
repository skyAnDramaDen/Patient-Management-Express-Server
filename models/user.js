const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Adjust the path as necessary


const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { 
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('super-admin', 'admin', 'doctor', 'nurse', "patient"),
    allowNull: false
  }
}, {
  timestamps: true // Enables createdAt & updatedAt
});

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});


module.exports = User;
