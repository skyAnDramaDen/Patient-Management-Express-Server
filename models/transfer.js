// transfers.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Transfer = sequelize.define(
  'transfer',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    admissionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'admissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    previousBedId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'beds',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    newBedId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'beds',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    transferDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: true }
);

// Associations
Transfer.associate = function (models) {
  Transfer.belongsTo(models.Admission, { foreignKey: 'admissionId' });
  Transfer.belongsTo(models.Bed, { foreignKey: 'previousBedId', as: 'previousBed' });
  Transfer.belongsTo(models.Bed, { foreignKey: 'currentBedId', as: 'currentBed' });
};

module.exports = Transfer;
