const mongoose = require('mongoose');

const database = async()=>{
    try {
        mongoose.connect(process.env.MONGODB_URL)
        console.log('database connected successfully');
    } catch (error) {
        console.log('error while connecting to Mongodb :: ' ,error);
    }
}

module.exports = database;