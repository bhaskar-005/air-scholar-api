const course = require('../model/course');
const section = require('../model/section')

exports.createSection = async(req,res)=>{
    try {
        const {sectionName, courseId} = req.body;
        if (!sectionName) {
            return res.status(404).json({
                message: 'all fields must be provided'
            })
        }
        const sectionCreate = await section.create({
            sectionName:sectionName
        })
        //push the id of this section to course
        const updateCourse = await course.findByIdAndUpdate(courseId,
            {
                $push:{ 
                    courseContent : sectionCreate._id,
                }
            },{new: true})
            .populate({
                path: 'courseContent',
                populate:'subSection',
                
            })
        res.status(200).json({
            success: true,
            message: "Section created successfully",
            updateCourse,
         });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}

exports.updateSection = async (req,res)=>{
    try {
        const {sectionName, sectionId,courseId} = req.body;
        //update section
        const updateSection = await section.findByIdAndUpdate(
            sectionId,
            {
                sectionName :sectionName
            },
            {new:true});

        if (updateSection) {
         const data = await course.findById(courseId).populate({
            path: 'courseContent',
            populate:'subSection',
         })
         return res.status(200).json({
                data,
                success: true,
                message: 'section updated successfully'
         })   
        }
        
    } catch (error) {
        console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "section not updeted",
		});
    }
}
exports.deleteSection = async( req,res)=>{
   try {
    const {sectionId , courseId} = req.body;
    
   const deleteing = await section.findByIdAndDelete(sectionId);
   const courseData = await course.findByIdAndUpdate(courseId ,{
        $pull:{courseContent: sectionId}
    },{new:true}).populate({
        path: 'courseContent',
        populate:'subSection',
    })

    res.status(200).json({
        data:courseData,
		success:true,
		message:"Section deleted",
	});
    
   } catch (error) {
    res.status(500).json({
        success: false,
        message: "section not deleted",
    });
   }  
}