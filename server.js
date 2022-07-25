require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan')
const connectDB = require('./config/db')
const routes = require('./router/router');
const bodyParser = require('body-parser');


// Setting up port
let PORT = process.env.PORT || 3000;
connectDB()

//=== 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(cors());

// for parsing application/json
app.use(express.json());

// for parsing application/xwww-
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json())
    //making use of morgan for development debugging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//Consuming our api
app.use(routes)



//=== 3 - START SERVER
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT + '/'));