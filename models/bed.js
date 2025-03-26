const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Bed = sequelize.define(
    'bed',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        bedNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM('regular', 'ICU', 'pediatric', 'maternity'),
            allowNull: false,
            defaultValue: 'regular',
        },
        status: {
            type: DataTypes.ENUM('available', 'occupied', 'under_maintenance'),
            allowNull: false,
            defaultValue: 'available',
        },
        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'room',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    },
    { timestamps: true }
);

module.exports = Bed;
