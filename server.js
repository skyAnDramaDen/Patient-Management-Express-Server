const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authenticate = require('./middleware/auth.js');

const { login } = require('./controllers/auth.controller.js');

const sequelize = require("./db.js");

const app = express();
const port = 3000;
app.use(express.json());

app.use(cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', login);

// app.use(authenticate);


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
const userRouter = require("./routes/userRouter.js");

app.use('/patients', patientRouter);
app.use('/doctors', doctorRouter);
app.use('/schedule', scheduleRouter);
app.use('/user', userRouter);

app.get("/", (req, res) => {
    console.log("This is the get first 111");
    console.log("----Wwwwwwwwwwwww------");
});