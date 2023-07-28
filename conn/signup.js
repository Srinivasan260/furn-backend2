const mongoose = require("mongoose");

const Signup = new mongoose.Schema({
    
    firstname :{
        type :String,
        required : true
    },
    Secondname :{
        type :String,
        required : true
    },
    Age:{
        type :Number,
        required : true
    },
    Phn:{
        type :Number,
        required : true
        
    },
    email :{
        type :String,
        required : true
    },
    password :{
        type :String,
        required : true
    },
    verified :{
        type:Boolean,
        required : true
    }

})

module.exports = mongoose.model("furniture-signup",Signup)