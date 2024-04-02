const course = require('../model/course');
const section = require('../model/section');
const subsection = require('../model/subsection');
const uploadCloudinary = require('../utils/Cloudinary');


//create a new subsection
exports.createSubsection = async (req, res) => {
  try {
    const { sectionId, title, description, courseId } = req.body;
    const video = req.file.path;

    if (!sectionId || !title || !description || !video) {
      return res.status(404).json({
        message: "all fields are required",
        success: false,
      });
    }
    const uploadDetails = await uploadCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //now create a new subsection
    const newSubsection = await subsection.create({
      title,
      description,
      timeDuration: uploadDetails.duration,
      videoUrl: uploadDetails.secure_url,
    });
    const updatedSection = await section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: newSubsection._id,
        },
      },
      { new: true }
    );
    const updatedCourse = await course.findById(courseId).populate({
      path: "courseContent",
      populate: "subSection",
    });
    return res.status(200).json({
      success: true,
      message: "subsection created successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error creating new sub-section ::", error);
    return res.status(500).json({
      success: false,
      message: "error while creating new sub-section",
      error: error.message,
    });
  }
};

//delete a subsection
exports.deleteSubsection = async(req,res)=>{
   try {
    const { subSectionId, sectionId ,courseId} = req.body;
    //pulling subsection from section
    await section.findByIdAndUpdate(sectionId ,{
        $pull:{subSection: subSectionId}
    })

    //now delete the subsection
    const deleteSubsection = await subsection.findByIdAndDelete(subSectionId);

    if (!deleteSubsection) {
        return res.status(404).json({
             success: false, 
             message: "SubSection not found" 
         })
      }
      const updatedCourse = await course.findById(courseId).populate({
        path: "courseContent",
        populate: "subSection",
      });
     return res.json({
        data:updatedCourse,
        success: true,
        message: "SubSection deleted successfully",
      });
   } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
   }
}