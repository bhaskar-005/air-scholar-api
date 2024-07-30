const user = require("../model/user");
const otp = require("../model/otp");
const bcrypt = require("bcryptjs");
const profile = require("../model/profile");
const otpGenerator = require("otp-generator");
const jwt = require('jsonwebtoken');
const { redisClient } = require("../redis/index");
require('dotenv').config();


exports.refreshToken = async(req,res)=>{
  try {
    const {token} = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const findUser = await user.findById(decoded.id).populate('moreInfo')
             .populate({
              path:'course',
              populate: 'courseContent'
             });
    
    findUser.password = null;
    findUser.resetPasswordExpires=null;

    return res.status(200).json({
      message:'deconde successful',
      findUser,
    })
  
  } catch (error) {
    return res.status(500).json({
      message: 'your token is invalid',
      success: false
    })
  }


}
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      EmailOtp,
    } = req.body;
  
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !EmailOtp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "confirm password is incorrect",
      });
    }
    //check if email is aleady registered or not
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }
    //check the recent otp for email
    const findOtp = await otp.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(findOtp);
    if (findOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "otp not found",
      });
    }
    if (EmailOtp !== findOtp[0].otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    //profile
    const profileDetails = await profile.create({
      gender: null,
      dob: null,
      about: null,
      phonenumber: null,
    });

    //creating a new user
    const newUser = await user.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: accountType,
      moreInfo: profileDetails._id,
      profilePhoto: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}`,
    });
    return res.status(200).json({
      sucess: true,
      message: "account created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "not able to sign up..",
    });
  }
};
exports.signupUpdate = async (req, res) => {
  try {
    const {
      id,
      email,
      password,
    } = req.body;
  
  

    const hashedPassword = await bcrypt.hash(password, 10);
    //profile
    const profileDetails = await profile.create({
      gender: null,
      dob: null,
      about: null,
      phonenumber: null,
    });

    //creating a new user
    const newuser = await user.findById(id);
    console.log(newuser,'userbefore');
    newuser.password = hashedPassword;
    console.log(newuser,'userafter');
    newuser.save();
    return res.status(200).json({
      sucess: true,
      message: "account created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "not able to sign up..",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `all fields are required`,
      });
    }

    const User = await user.findOne({ email })
    .populate('moreInfo')
    .populate({
      path:'course',
      populate: 'courseContent',
     });
    if (!User) {
      return res.status(401).json({
        success: false,
        message: `user is not registered`,
      });
    }
    //verify the user password and jwt token
    const payload = {
      email: User.email,
      id: User._id,
      role: User.accountType,
    };
    if (await bcrypt.compare(password, User.password)) {
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "48h",
      });

      User.token = token;
      User.password = undefined;
    

      //create cookie and return response
      res.cookie("access_token", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        })
        .status(200)
        .json({
          success: true,
          token,
          User,
          message: "user Logged in successfully",
        });
        
    } else {
      return res.status(404).json({
        message: "password is incorrect",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "not able to login",
    });
  }
};

//otp
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otpLimit = await redisClient.get(`opt-Limit:${email}`);
    if (otpLimit) {
     return  res.status(429).json({
      message:'wait for 40s'
    })
    }
    await redisClient.setex(`opt-Limit:${email}`,40,'1');
    
    if (otpLimit) {
      return res.status(300).json({
        message:'otp already send'
      })
      return
    }
    //email validation
    const checkUserPresent = await user.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }
    //otp generation
    const generatedOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    
    const otpBody = await otp.create({
      email: email,
      otp:generatedOtp,
    });
     return res.status(200).json({
        success: true,
        message: `OTP Sent Successfully`,
      });
    }catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error,
    });
  }
};
