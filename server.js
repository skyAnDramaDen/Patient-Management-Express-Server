require("dotenv").config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// (process.env.STRIPE_PRIVATE_KEY)

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

app.use(authenticate);

let users = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const role = socket.handshake.query.role;

    socket.on("join", ({ username, role, userId }) => {
        users[socket.id] = { username, role, userId };
        
        io.emit("users", Object.values(users).map(u => ({ username: u.username, role: u.role, userId: u.userId })));
    });

    //  private messages
    socket.on("privateMessage", ({ recipient, message, sender }) => {
        const recipientSocket = Object.keys(users).find(
            (id) => users[id].userId === recipient
        );
        
        if (recipientSocket) {
            console.log(`Sending private message from ${users[socket.id].username} to ${recipient}`);
            io.to(recipientSocket).emit("receivePrivateMessage", {
                sender: sender,
                message
            });
        } else {
            console.log(`User ${recipient} is offline or does not exist.`);
        }
    });

    //  user disconnect
    socket.on("disconnect", () => {
        if (users[socket.id]) {
            console.log(`${users[socket.id].username} disconnected`);
            delete users[socket.id];
        }

        //  updated users list
        io.emit("users", Object.values(users).map(u => ({ username: u.username, role: u.role, userId: u.userId })));
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
const medicalRecordsRouter = require("./routes/medicalRecordRouter.js");
const wardRouter = require("./routes/wardRouter.js");
const floorRouter = require("./routes/floorRouter.js");
const roomRouter = require("./routes/roomRouter.js");
const paymentRouter = require("./routes/paymentRouter.js");
const bedRouter = require("./routes/bedRouter.js");
const admissionRouter = require("./routes/admissionRouter.js");
const billingCategoryRouter = require("./routes/billingCategoryRouter.js");

app.use('/patients', patientRouter);
app.use('/doctors', doctorRouter);
app.use('/schedule', scheduleRouter);
app.use('/user', userRouter);
app.use('/appointment', appointmentRouter);
app.use('/medicalRecords', medicalRecordsRouter)
app.use('/wards', wardRouter)
app.use('/floors', floorRouter)
app.use('/rooms', roomRouter)
app.use('/payment', paymentRouter)
app.use('/beds', bedRouter);
app.use('/admissions', admissionRouter);
app.use('/billingCategory', billingCategoryRouter);

app.get("/", (req, res) => {
    console.log("This is the get first 111");
    console.log("----Wwwwwwwwwwwww------");
});