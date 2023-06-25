const mongoose = require("mongoose");

const Products = new mongoose.Schema({
    
    Productname :{
        type :String,
        required : true
    },
    Category :{
        type :String,
        required : true
    },
    Productbrand:{
        type :String,
        required : true
    },
    Price:{
        type :Number,
        required : true
        
    },
    email:{
        type:String,
        required:true
    }
 
})

module.exports = mongoose.model("furniture-products",Products)