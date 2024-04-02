const course = require('../model/course');
const ratingReviews = require('../model/ratingReview');

exports.createRatingReview = async(req,res)=>{
    try {
        const {rating ,review,courseId} = req.body;
        const userId = req.User.id;

        if (!rating ||!review) {
            return res.status(404).json({
                message:'all fields are required'
            });
        }
        //check if user is enrolled or not 
        const userVerify = await course.findOne({_id:courseId,
            studentsEnrolled: { $elemMatch: { $eq:userId}}
        }).populate('ratingAndReviews');
        console.log(userVerify);
        if (!userVerify) {
            return res.status(403).json({
              message: 'you are not enrolled'
            });
        }
        if (userVerify.ratingAndReviews.map(review =>review.user == userId)) {
            return res.status(403).json({
                message: 'You can only create one rating and review for this course.'
            });
        }
        
        //create a new rating review
        const createRatingReview = await ratingReviews.create({
            rating,
            review,
            user:userId,
            course:courseId,
        }) 
        const updateCoruse = await course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews : createRatingReview._id
                }
            },{new: true});
       
        return res.status(200).json({
            success: true,
            message: 'rating review created',
            createRatingReview,
        })
        
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
    }
}

//average rating of a course
// we will use aggregate call
exports. averageRating = async(req,res)=>{
   try {
    const courseId = req.body.courseId;

    const result = await ratingReviews.aggregate(
        [
            {$match :{course : courseId}},
            {$group :{_id: null } , total :{$avg: '$rating'}} // null will add all data https://media.geeksforgeeks.org/wp-content/uploads/20210209233143/Aggregate-660x477.png
        ]
    )
    if (result.length>0) {
        return res.status(200).json({
            success:true,
            rating : result.total,
        })
    }
    return res.status(404).json({
        message:'no rating till now'
    })
   } catch (error) {
    return res.status(500).json({
        success:false,
        message:error.message,
    })
   }
}
//--- get all rating
exports.getAllRating = async (req,res)=>{
    try {
        const AllRating = await ratingReviews.find({})
        .sort({createdAt : -1})
        .populate({
            path: 'user',
            select : 'firstName lastName email profilePhoto',
        })
        .populate({
            path: 'course',
            select : 'couresName'
        })
        .exec();
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:AllRating,
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
} 