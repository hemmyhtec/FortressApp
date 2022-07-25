require('dotenv').config()
const mongoose = require('mongoose');

const connUri = process.env.MONGODB_URI;

const connectDB = async() => {
    //=== 2 - SET UP DATABASE
    //Configure mongoose's promise to global promise
    mongoose.promise = global.Promise;
    mongoose.connect(connUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const connection = mongoose.connection;
    connection.once('open', () => console.log('MongoDB --  database connection established successfully!'));
    connection.on('error', (err) => {
        console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
        process.exit();
    });
}

module.exports = connectDB