const course = require('../model/course');
const user = require ('../model/user');
const uploadCloudinary = require('../utils/Cloudinary');
const category  = require('../model/category');

exports.createCourse = async(req,res)=>{
   try {
    const userId = req.User.id;
    const {
      couresName,
      courseDescription,
      whatYouWillLearn,
      price,
      categoryId,
      status,
    } =req.body;

    const thumbnail = req.file.path;
    if (
        !couresName ||
        !courseDescription ||
        !whatYouWillLearn ||
        !price ||
        !thumbnail ||
        !categoryId 
      ) {
        return res.status(400).json({
          success: false,
          message: "All Fields are Mandatory",
        })
      }
      let setStatus = status;
      if (!status || status === undefined) {
        setStatus = "Draft"
      }
      //check use is instructor or not
      const instructorInfo = await user.findById(userId,{accountType:'instructor'});
      if (!instructorInfo) {
        return res.status(404).json({
            success: false,
            message: "Instructor Details Not Found",
          });
      }
     //check if category is valid or not
     const find = await category.findById(categoryId);
     if (!find) {
        if (!categoryDetails) {
            return res.status(404).json({
              success: false,
              message: "invalid category",
        })
     }}
     
     //uploading thumbnail to cloudnary
     const uploadImg = await uploadCloudinary(thumbnail,process.env.FOLDER_NAME)
     
     let actualPrice ;
     if(price.length == 2){
      actualPrice = +price + 49;
     }
     else if(price.length == 3){
      actualPrice = +price + 99;
     }
     else if(price.length == 4){
      actualPrice = +price + 399;
     }
     else if(price.length <= 5){
      actualPrice = +price + 999;
     }
     console.log(actualPrice);
     //createing course
     const newCourse = await course.create({
        couresName,
        courseDescription,
        instructor: instructorInfo._id,
        whatYouWillLearn: whatYouWillLearn,
        price,
        actualPrice,
        category: find._id,
        thumbnail: uploadImg.secure_url,
        status: setStatus,
      })
     
     //adding course to user schema
     await user.findByIdAndUpdate(instructorInfo._id,
        {
            $push:{course: newCourse._id}
        })
    //adding coures to category
    await category.findByIdAndUpdate(find._id,
        {
            $push : {courses: newCourse._id}
        })
      
    res.status(200).json({
        success: true,
        data: newCourse,
        message: "Course Created Successfully",
        })
   } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
   }
}

//get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await course.find(
      { status: "Published" },
      {
        couresName: true,
        price: true,
        actualPrice:true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      },
      {sort: { createdAt: -1 }}
    )
      .populate("instructor")
      .populate('ratingAndReviews')
      .exec();
    
      allCourses.forEach(course => {
        if (course.instructor) {
          course.instructor.password = undefined;
          course.instructor.course = undefined;
          course.instructor.resetToken = undefined;
          course.instructor.resetPasswordExpires = undefined;
        }
      });

    const mostEnrolled = allCourses.sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length);
    return res.status(200).json({
      success: true,
      data: mostEnrolled,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}

//get course by id 
exports.getCourseDetails = async (req,res)=>{
  try {
    const {courseId} = req.body;
    const findCourse = await course.findOne({_id :courseId}).populate({
       path:'instructor',
       select:'profilePhoto moreInfo lastName firstName email ',
       populate:{
         path: 'moreInfo'
       }
    })
    .populate({
      path:'category',
      select:'description name'
    })
    .populate({
      path:'ratingAndReviews',
      populate:{
        path:'user',
        select:'profilePhoto moreInfo lastName firstName ',
      }
    })
    .populate({
      path: 'courseContent',
      populate:{
        path:'subSection',
        select: "title timeDuration description"
    }
    }).exec();

    if (!findCourse) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        findCourse,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


//full access course
exports.getFullAccessCourse = async (req,res)=>{
  try {
    const {courseId} = req.body;
    const findCourse = await course.findOne({_id :courseId})
    .populate({
      path: 'courseContent',
      populate:'subSection',
    }).exec();

    if (!findCourse) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    return res.status(200).json({
      success: true,
      course:findCourse,
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


//update course
exports.updateCourse = async(req,res)=>{
  try {
    const {
      couresName,
      courseId,
      courseDescription,
      whatYouWillLearn,
      price,
      categoryId,
      status,
      thumbnail
    } =req.body;
  
    if (
      !couresName ||
      !courseId ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !categoryId || 
      !status
    ) {

      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    //checking if course exists
    const findCourse = await course.findById(courseId);
    if(!findCourse){
      return res.status(404).json({
        success:false,
        message: "Course not found",
      })
    }
    //checking the category exists or not
    const categoryCheck = await category.findById(categoryId);
    if (!categoryCheck) {
      return res.status(404).json({
        success:false,
        message:'category not found',
      });
    }

    findCourse.couresName = couresName;
    findCourse.courseDescription =courseDescription;
    findCourse.whatYouWillLearn = whatYouWillLearn;
    findCourse.price = price;
    findCourse.category = categoryId
    findCourse.status = status;

    if(!thumbnail){
       const thumbnail = req.file.path;
       console.log('uploading to couldnary');
       const uploadImg = await uploadCloudinary(thumbnail,process.env.FOLDER_NAME);
       findCourse.thumbnail = uploadImg.secure_url;
    }
    else{
      findCourse.thumbnail = thumbnail;
    }
    await findCourse.save();

    const newCourse = await course.findById(courseId).populate({
      path:'courseContent',
      populate: 'subSection'
    })

    return res.status(200).json({
      success: true,
      message : 'Course updated successfully',
      data: newCourse,
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success:false,
      message:'course not updated',
      error:error.message,
    })
  }
}


//instructor course 
exports.instructorCourse = async(req,res)=>{
  try {
   const instructorId = req.User.id; 

   const findUser = await user.findById(instructorId).populate({
    path:'course',
    options: { sort: { createdAt: -1 } },
    populate:'courseContent'
   });
   
 
   const filteredCourses = findUser.course.filter(course => course.instructor.toString() === instructorId.toString());

   return res.status(200).json({
    data:filteredCourses,
    message:'instructor course find successfully'
   })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:'instructor course not found',
      success:false
    })
  }
}