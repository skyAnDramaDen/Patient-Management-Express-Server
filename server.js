const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const http = require("http");
const { Server } = require("socket.io");

const authenticate = require('./middleware/auth.js');

const { login } = require('./controllers/auth.controller.js');

const sequelize = require("./db.js");

const app = express();
const port = 3000;

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
});


app.use(express.json());

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', login);

// app.use(authenticate);

let users = {};


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    
    socket.on("join", (username) => {
        users[socket.id] = username;
        io.emit("users", users);
    });

    
    socket.on("sendMessage", (message) => {
        io.emit("receiveMessage", message);
    });

    
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
        io.emit("users", users);
    });
});


sequelize.sync()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch(err => console.error('Failed to sync database:', err));

const patientRouter = require("./routes/patientRouter.js");
const doctorRouter = require("./routes/doctorRouter.js");
const scheduleRouter = require("./routes/scheduleRouter.js");
const userRouter = require("./routes/userRouter.js");
const appointmentRouter = require("./routes/appointmentRouter.js");

app.use('/patients', patientRouter);
app.use('/doctors', doctorRouter);
app.use('/schedule', scheduleRouter);
app.use('/user', userRouter);
app.use('/appointment', appointmentRouter);

app.get("/", (req, res) => {
    console.log("This is the get first 111");
    console.log("----Wwwwwwwwwwwww------");
});