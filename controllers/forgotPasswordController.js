const TokenGenerator = require('tokgen');
const mailSender = require('../utils/NodeMailer');
const user = require('../model/user');
const forgotPassword = require('../Mail-template/ForgotPassword');
const bcrypt = require('bcrypt');

exports.forgotPasswordToken = async (req,res)=>{
    try {
        const email  = req.body.email;
        const User = await user.findOne({ email: email });
        if(!User){
            return res.status(404).json({
                message: 'email is not registered',
            })
        }
        let generator = new TokenGenerator({chars: '0-9a-f', length: 20});
        let token = generator.generate();

        const uploadToken = await user.findOneAndUpdate({email},
            {
                resetToken: token,
                resetPasswordExpires: Date.now()+350000, // storing the time
            });
        
        const url = `${process.env.UPDATE_PASSWORD_ROUTE}/${token}`;
        console.log(url);

        await mailSender(
              email,
             'Password Updated Link For AirScholar',
             forgotPassword(url),
          );
          
        return res.status(200).json({
            success: true,
            message: 'Mail sent successfully'
        })
        

    } catch (error) {
        console.log(error);
        return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
    }
}

exports.changePassword = async (req,res)=>{
    try {
        const{password, confirmPassword , token} = req.body;
        if (!password||!confirmPassword||!token) {
            return res.status(401).json({
                success: false,
                message: 'please enter your new password'
            })
        }
        if (password != confirmPassword) {
            return res.status(401).json({
                success:false,
                message: "your password are not matching"
            })
        }
        const userDetails = await user.findOne({ resetToken: token });
		if (!userDetails) {
			return res.status(402).json({
				success: false,
				message: "Token is Invalid",
			});
		}
        if(userDetails.resetPasswordExpires < Date.now()) {
            return res.status(404).json({
                success:false,
                message: 'token is expired'
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const updatePassword = await user.findOneAndUpdate({resetToken:token},
            {password:hashedPassword}
            )
        return res.status(200).json({
            success : true,
            message: 'password updated successfully'
        })
    } catch (error) {
        return res.json({
			error: error,
			success: false,
			message: `Some Error in Updating the Password`,
		});
    }
}