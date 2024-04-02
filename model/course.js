const mongoose = require('mongoose');

const course = new mongoose.Schema({
    couresName:{
        type:String,
        required:true,
    },
    courseDescription:{
        type:String,
        required:true,
    },
    instructor: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "user",
	},
    whatYouWillLearn: {
		type: String,
	},
    price:{
       type:Number,
       required:true,
    },
	actualPrice:{
        type:Number
	},
    courseContent:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'section'
    }],
    ratingAndReviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "ratingReview",
		},
	],
    thumbnail: {
		type: String,
	},
    category: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "category",
	},
    studentsEnrolled: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "user",
		},
	],
    status: {
		type: String,
		enum: ["Draft", "Published"],
	},
},{timestamps:true})

module.exports = mongoose.model('course', course);