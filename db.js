const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('patient_management', 'root', 'ganymeyde', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection to MySQL database established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the MySQL database:', err);
    });

module.exports = sequelize;