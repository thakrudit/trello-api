const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require("dotenv").config();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { Server } = require("socket.io")

const app = express();

const server = require("http").createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`+++++ User Connected : +++++ ${socket.id}`);

    socket.on("join_chat", (chat_id) => {
        socket.join(chat_id);
        // console.log(`+++++ User with ID : ${socket.id} joined chat: ${chat_id} +++++`);
    });

    socket.on("send_message", (data) => {
        // io.in(data.chat_room_id).emit("receive_message", data);
        io.to(data.chat_room_id).emit("receive_message", data);
        // console.log("+++++ data send_message +++++", data)
    });

    socket.on("send_notification", (data) => {
        // console.log("Received notification data : ========================================", data);
        io.emit("receive_notification", data);
    });

    socket.on("disconnect", () => {
        console.log("+++++ User Disconnected +++++ ", socket.id);
    })
})


// Middlewares
const corsOpts = {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
};

app.use(cors(corsOpts));
app.use(fileUpload());

app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');

    next();
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/trelloapi', (req, res) => {
    res.send('Hello World! from trello api');
});

// Import the Router Files
const indexRoute = require("./routes/indexRoute");

// Use the Routes
app.use("/api/v1", indexRoute)

// error handler
// app.use(function (err, req, res, next) {

//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

// Start the server
const PORT = process.env.APP_PORT || 3000;
server.listen(PORT, () => {
    console.clear();
    console.log(`${process.env.APP_NAME} Server is running on port ${PORT}`);
});

module.exports = app;
