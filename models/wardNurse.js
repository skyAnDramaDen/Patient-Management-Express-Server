const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const WardNurse = sequelize.define(
	"ward_nurse",
	{
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		wardId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		nurseId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{ timestamps: true }
);

module.exports = WardNurse;
