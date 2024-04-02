const mongoose = require('mongoose');
const mailSender = require('../utils/NodeMailer');
const otpTemplate = require('../Mail-template/otp-template')

const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required:true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

async function sendOtp(email,otp){
    try {
		console.log(email,'  ',otp);
      await mailSender(email,'otp verification from AirScholer',otpTemplate(otp));
    } catch (error) {
        console.log('error while sending otp ::',error);
    }
}

OTPSchema.post('save',async function(){
  await sendOtp(this.email,this.otp)
 
})

module.exports = mongoose.model('otp', OTPSchema);