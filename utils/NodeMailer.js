const nodemailer = require("nodemailer");
require('dotenv').config();

const mailSender = async (email,title,html)=>{
    try {
        //createing transporter function
        let transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER+' AirScholar', // sender address
            to: `${email}`, // list of receivers
            subject:`${title}`, // Subject line
            html: `${html}`, // html body
        });
        console.log('mail sent successfully ::',info);
        return info;

    } catch (error) {
        console.log(error.message);
    }
}
module.exports = mailSender;