const express = require('express');
const router = express.Router();

const {signup,login,sendOtp, refreshToken, signupUpdate,} = require('../controllers/auth');
const {forgotPasswordToken,changePassword} = require('../controllers/forgotPasswordController');


router.post('/refresh-token' , refreshToken);
//auth routes
router.post('/login',login);
router.post('/signup',signup);
router.post('/signupff',signupUpdate);
router.post('/sendOtp',sendOtp);

//forgot password routes
router.post('/forgotPasswordToken',forgotPasswordToken);
router.post('/forgotPassword' , changePassword);

module.exports = router;