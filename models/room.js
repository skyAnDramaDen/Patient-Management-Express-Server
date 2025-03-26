const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Room = sequelize.define(
    'room',
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
        wardId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
            model: "ward",
            key: "id"
            },
            onDelete: "CASCADE"
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        }
    },
    { timestamps: true }
);

module.exports = Room;