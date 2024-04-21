const { default: mongoose } = require('mongoose');
const course = require('../model/course');
const user = require('../model/user');
const crypto = require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config();


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret:process.env.RAZORPAY_SECRET ,
});

exports.capturePayment = async(req,res)=>{
   const {courses} = req.body;
   console.log(courses);
   const userId = req.User.id;

   if (courses.length == 0) {
    return res.status(404).json({
        message:'please provide course id'
    })
   }
   
   let total = 0;

   for(const id of courses){
     try {
        const findcourse = await course.findById(id);
        if(!findcourse){
            return res.status(404).json({
                message:'course not found'
            })
        }
        //turing the string to ojectId
        const ObjId = new mongoose.Types.ObjectId(userId);
        //now check if it includes in the course
        if (findcourse.studentsEnrolled.includes(ObjId)) {
             return res.status(404).json({
                message:'user already enrolled'
             })
        }
        total += findcourse.price;
     } catch (error) {
        console.log(error);
        return res.status(404).json({
            success:false,
            message:'faild to find course'
        })
     } 

     console.log(total);
     if (total == 0) {
        try {
            for(const id of courses){
                const updateCourse = await course.findByIdAndUpdate(
                    courses,
                    {$push : {studentsEnrolled:userId}}
                    ,{new:true}
                )
                if (!updateCourse) {
                    return res.status(400).json({
                        message:'course not found '
                    })
                }
                //updateing the user
                const updateUser = await user.findByIdAndUpdate(
                    userId,
                    {$push : {course:id}},
                    {new:true},
                ).populate({
                    path:'course',
                    populate: 'courseContent'
                   });
                
             return res.status(202).json({
                message:'user enrolled successfully',
                success:true,
                user: updateUser
             })
             }
        } catch (error) {
            return res.status(400).json({
                message:'user not enrolled',
                success:false
             })
        }
     }
   }
   //now create options 
   const options={
    amount : total*100,
    currency:'INR',
    receipt: (Date.now()).toString(),
   }
   //createing order
   try {
    const payment = await razorpayInstance.orders.create(options);
    res.json({
        success: true,
        data: payment,
    }); 
} catch (error) {
    console.log(error);
    return res.status({
        message:'error while creating order'
    })
   }
}


exports.verifyPayment = async(req,res)=>{
   const razorpay_order_id = req.body.razorpay_order_id;
   const razorpay_payment_id = req.body.razorpay_payment_id;
   const razorpay_signature_id = req.body.razorpay_signature;
   const courses = req.body.courses;
   const userId = req.User.id
   
   if(!userId||!courses||!razorpay_signature_id||!razorpay_payment_id||!razorpay_order_id){
    return res.status(403).json({
        message:'please provide all information '
    })
   }
   let body = razorpay_order_id + `|`+ razorpay_payment_id;
   const expectedSignature = crypto.createHmac('sha256',process.env.RAZORPAY_SECRET)
                             .update(body.toString())
                             .digest('hex');
    
   if (expectedSignature == razorpay_signature_id) {
     //now enroll student
     try {
        for(const id of courses){
            const updateCourse = await course.findByIdAndUpdate(
                courses,
                {$push : {studentsEnrolled:userId}}
                ,{new:true}
            )
            if (!updateCourse) {
                return res.status(400).json({
                    message:'course not found '
                })
            }
            //updateing the user
            const updateUser = await user.findByIdAndUpdate(
                userId,
                {$push : {course:id}},
                {new:true},
            ).populate({
                path:'course',
                populate: 'courseContent'
               });
            
         return res.status(200).json({
            message:'user enrolled successfully',
            success:true,
            user: updateUser
         })
         }
         
     } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:'error while enrolling user',
        })
     }
   }

}