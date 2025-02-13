const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { Doctor, Patient, Appointment } = require('./models/index.js');
const sequelize = require("./db.js");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Sync database
sequelize.sync()
    .then(() => {
        console.log('Database synced');
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch(err => console.error('Failed to sync database:', err));


const patientRouter = require("./routes/patientRouter.js");
const doctorRouter = require("./routes/doctorRouter.js");
const scheduleRouter = require("./routes/scheduleRouter.js");

app.use('/patients', patientRouter);
app.use('/doctors', doctorRouter);
app.use('/schedule', scheduleRouter);

app.get("/", (req, res) => {
    console.log("This is the get first 111");
    console.log("----Wwwwwwwwwwwww------");
});