const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require("dotenv").config();
const cors = require("cors");

const app = express();

// const server = require("http").createServer(app);

// Middlewares
const corsOpts = {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
};

app.use(cors(corsOpts));

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

// Import the Router Files
const indexRoute = require("./routes/indexRoute")

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
app.listen(PORT, () => {
    console.clear();
    console.log(`${process.env.APP_NAME} Server is running on port ${PORT}`);
});

module.exports = app;
