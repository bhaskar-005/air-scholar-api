const mongoose = require('mongoose');

const profile = new mongoose.Schema({
    phonenumber:{
        type:Number,
        trim:true,
    },
    dob:{
        type:Date,
    },
    about:{
        type:String,
    },
    gender: {
		type: String,
	},
})
module.exports = mongoose.model("profile", profile);