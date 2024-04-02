const mongoose = require('mongoose');

const category = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
    },
    description:{
       type:String,
    },
    courses:[
      {
       type :mongoose.Schema.Types.ObjectId,
       ref:'course',
      }
    ]
})

module.exports = mongoose.model('category', category)