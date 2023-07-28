const mongoose = require('mongoose')



const Otp = new mongoose.Schema({
    
    userId :{
        type :String,
        required : true
    },
    Otp:{
        type :String,
        required : true
    },
    createdAt :{
        type :Date,
        required : true
        
    },
    expiresAt :{
        type :Date,
        required : true
        
    }
   
})

module.exports = mongoose.model("signup-OtP",Otp)

