const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {verify,isAdmin, isInstructor} = require('../middleware/verify');

const {createCategory,showAllCategories,categoryFind} = require('../controllers/categoryController');
const {createCourse,getAllCourses,getCourseDetails, updateCourse, instructorCourse, getFullAccessCourse} = require('../controllers/Course');
const {createRatingReview,averageRating,getAllRating} = require('../controllers/ratingReviewController');
const {createSection,updateSection,deleteSection} = require('../controllers/sectionController');
const {createSubsection,deleteSubsection} = require('../controllers/subsectionController');

//category router
router.post('/categoryCreate',verify,isAdmin,createCategory);
router.get('/allcategories',showAllCategories);
router.post('/categoryFind', categoryFind);

//course router
router.post('/createCourse',verify,isInstructor,upload.single('thumbnail'),createCourse);
router.put('/editCourse',verify,isInstructor,upload.single('thumbnail'),updateCourse);
router.get('/instructorCourse',verify,isInstructor,instructorCourse);
router.get('/getCourse',getAllCourses);
router.post('/getcourseDetail',getCourseDetails);
router.post('/fullaccesscourse',verify, getFullAccessCourse);
//---> todo delete and update router

//rating and review routes
router.post('/createRatingReview',verify, createRatingReview);
router.post('/averageRating' ,verify, averageRating);
router.get('/addRatingReview' ,verify, getAllRating);

//section routers
router.post('/createSection',verify ,isInstructor, createSection);
router.delete('/deleteSection' ,verify,isInstructor, deleteSection);
router.put('/updateSection' ,verify,isInstructor, updateSection);

//subsection routers
router.post('/createSubsection',verify ,isInstructor,upload.single('video'), createSubsection);
router.delete('/deleteSubsection' ,verify,isInstructor, deleteSubsection);



module.exports = router;