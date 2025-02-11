module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'active',
      },
    });
  
    // Schedule.associate = function (models) {
    //   Schedule.belongsTo(models.Doctor, { foreignKey: 'doctorId' });
    //   Schedule.hasMany(models.Appointment, { foreignKey: 'scheduleId' });
    // };
  
    return Schedule;
  };
  