const express = require("express");
const dbconnect = require("./DB connect/database");
const authRoute = require('./routes/authRoute')
const contactRoute = require('./routes/contactRoute');
const profileRoute = require('./routes/profileRoute');
const courseRoute = require('./routes/courseRoute');
const payment = require('./routes/payment');
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors')

const PORT = process.env.PORT || 9000;
require("dotenv").config();
app.use(cors({ credentials: true, origin: process.env.CLINT_URL }));
//json parser
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>hi<h1/>");
});

//database connection
dbconnect();
app.use('/api/v1',authRoute);
app.use('/api/v1',contactRoute);
app.use('/api/v1',courseRoute);
app.use('/api/v1',profileRoute);
app.use('/api/v1',payment);

app.listen(PORT, (req, res) => {
  console.log("server is runing on:", PORT);
});
