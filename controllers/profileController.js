const course = require('../model/course');
const profile = require('../model/profile');
const user = require('../model/user');
const uploadCloudinary = require('../utils/Cloudinary');

//method to update the profile
exports.updateProfile = async(req,res)=>{
    try {
        const {firstName,
               lastName,
               dob='',
               about='',
               phonenumber='',
               gender='',
        } = req.body;

        console.log(req.body);
        const id = req.User.id;
        const updateUser = await user.findByIdAndUpdate(id ,{
            firstName,
            lastName,
        })
        const updateProfile = await profile.findByIdAndUpdate(updateUser.moreInfo,
            {
              dob,
              about,
              phonenumber,
              gender,
            })
      if(updateProfile){
        const updatedProfile = await user.findById(id)
        .populate('moreInfo')
        .populate({
          path: "course",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec();
        return res.status(200).json({
            success: true,
            message: 'profile updated successfully',
            data: updatedProfile
        })
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        success: false,
        error: error.message,
      })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id
      const userDetails = await user.findById(id)
        .populate("moreInfo")
        .exec();
      console.log(userDetails)
      res.status(200).json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  //update profile picture
  exports.updateProfilePicture= async(req,res)=>{
    try {
        const profile = req.files.path;
        const userId = req.user.id;
        if (!profile) {
            return res.status(404).json({
                success:false,
                message: 'plese select profile picture'
            })
        }
        const imgUpload = await uploadCloudinary(
          profile,
           process.env.FOLDER_NAME,
           1000,
           1000
        )
        const newProfileUpload = await user.findByIdAndUpdate(userId,
            {
                profilePhoto:imgUpload.secure_url,
            },
            {new:true});
            res.send({
                success: true,
                message: `Image Updated successfully`,
                data: newProfileUpload,
            })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
  }

//enrolled coures 
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await user.findOne({
        _id: userId,
      })
        .populate({
          path: "course",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userId}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.course,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  //details for instrucctor
  exports.instructorDashboard = async (req, res) => {
    try {
      const userId = req.User.id;
      const courseDetails = await course.find({ instructor: userId});
  
      const courseData = courseDetails.map((course) => {
        const totalStudents = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudents * course.price
        const totalReviews = course.ratingAndReviews.length 

        const courseDataWithStats = {
          _id: course._id,
          courseName: course.couresName,
          courseDescription: course.courseDescription,
          Image:course.thumbnail,
          totalStudents,
          totalAmountGenerated,
          totalReviews,
        }

        return courseDataWithStats
      })
  
      res.status(200).json({ 
        success:true,
        courses: courseData 
    })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }