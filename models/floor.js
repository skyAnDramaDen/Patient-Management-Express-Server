
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Floor = sequelize.define(
    'floor',
    {
        id:{ 
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    { timestamps: true }
);

module.exports = Floor;