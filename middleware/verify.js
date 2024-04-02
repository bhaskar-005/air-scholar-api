const jwt = require('jsonwebtoken');
require('dotenv').config();

//function to verify user authentication
exports.verify = async(req,res, next)=>{
  try {
    const token = req.cookies.access_token || req.headers['access_token'] || req.body.access_token;
    if(!token){
        return res.status(401).json({
            message: 'token not found',
            success: false,
        })
    }
    const decodeToken = await jwt.verify(token , process.env.JWT_SECRET );
    req.User = decodeToken;
    next();

  } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message: 'token is invalid'
    })
  }
}

exports.isStudent = async (req,res,next)=>{
    try {
        if (req.User.role !== 'student') {
            return res.status(400).json({
                success:false,
                message:'Restricted access: Only students are allowed.'
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'problem with user role'
        })  
    }
}
exports.isInstructor = async (req,res,next)=>{
    try {
        if (req.User.role !== 'instructor') {
            return res.status(400).json({
                success:false,
                message:'Restricted access: Only Instructor are allowed.'
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'problem with user role'
        })  
    }
}
exports.isAdmin = async (req,res,next)=>{
    try {
        console.log(req.User);
        if (req.User.role !== 'admin') {
            return res.status(400).json({
                success:false,
                message:'you are not allowed to access this route'
            })
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: 'problem with user role'
        })  
    }
}