const { json } = require('body-parser');
const category = require('../model/category');
const course = require('../model/course');
const { redisClient } = require('../redis');
// category creation
exports.createCategory = async(req,res)=>{
    try {
    const {name,description} = req.body;
    
    if (!name||!description) {
        return res.status(404).json({
            success: false,
            message: 'all fields required',
        })
    }
    const categoryDetails = await category.create({
        name,
        description,
    });
    return res.status(200).json({
        message:'category created successfully',
        success : true,
        categoryDetails
    })
    } catch (error) {
        return res.status(500).json({
			success: true,
			message: error.message,
		});
    }
}
//all courses from category
exports.showAllCategories = async (req, res) => {
	try {
    const cachedCategory = await redisClient.get('allCategories');
    if (cachedCategory) {
      return JSON.parse(cachedCategory);
    }
		const allCategorys = await category.find({}).select('name _id');
    await redisClient.set('allCategories',JSON.stringify(allCategorys))
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//category by id
exports.categoryFind = async(req,res)=>{
   const {categoryId} = req.body;
    try {
      const findCategory = await category
      .findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: "ratingAndReviews" },
          {
            path: "instructor",
            select: "email lastName firstName",
          },
        ],
      });
        if (!findCategory) {
            return res.status(404).json({
               message:'category not found',
               success:false,
            })
        }
        let mostEnrolled;
        const cachedMostEnrolled = await redisClient.get("MostEnrolled");
        if (cachedMostEnrolled) {
          mostEnrolled = JSON.parse(cachedMostEnrolled);
        }
        else{
          const courses = await course.find(
            { status: "Published" },
            {
              couresName: true,
              price: true,
              actualPrice:true,
              thumbnail: true,
              instructor: true,
              ratingAndReviews: true,
              studentsEnrolled: true,
            }
          ).populate({
            path: 'instructor',
            select: 'email lastName firstName',
          });

        const mostEnrolledmap = courses.sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length);
        mostEnrolled = mostEnrolledmap;
        await redisClient.set('MostEnrolled', JSON.stringify(mostEnrolled));
        }
        return res.status(200).json({
            message:'category found successfully',
            category:findCategory,
            mostEnrolled,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
    }
}
