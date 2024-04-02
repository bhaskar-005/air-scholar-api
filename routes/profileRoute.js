const express = require('express');
const router = express.Router();
const {isInstructor,verify } = require('../middleware/verify');
const upload = require('../middleware/multer');
const {
      updateProfile,
      getAllUserDetails,
      updateProfilePicture,
      getEnrolledCourses,
      instructorDashboard
    } = require('../controllers/profileController');


//profile routers
router.post('/updateProfile',verify, updateProfile);
router.get('/getUserDetails',verify,getAllUserDetails);
router.post('/updateProfilePicture',verify,upload.single('profile'),updateProfilePicture);
router.get('/getEnrolledCourses',verify,getEnrolledCourses);
router.get('/instructorDashboard',verify,isInstructor,instructorDashboard);

module.exports = router;