const mongoose = require('mongoose');

const user = new mongoose.Schema({
    firstName :{
        type:String,
        required:true,
        trim: true,
    },
    lastName :{
        type:String,
        required:true,
        trim: true,
    },
    email :{
        type:String,
        required:true,
        trim: true,
    },
    password :{
        type:String,
        required:true,
    },
    resetToken:{
      type:String,
      expires: 50*5
    },
    resetPasswordExpires: {
        type: Date,
    },
    profilePhoto:{
        type:String,
        required:true,
    },
    accountType:{
        type: String,
        enum :['instructor','student','admin'],
        required:true,
    },
    moreInfo:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'profile',
    },
    course:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
    }],

},{timestamps:true},)

module.exports = mongoose.model('user',user);