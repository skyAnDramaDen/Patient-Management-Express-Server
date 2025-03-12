
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Ward = sequelize.define(
    'ward',
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
        floorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
            model: "floor",
            key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        timestamps: true,
        tableName: "wards"
    }
);

module.exports = Ward;