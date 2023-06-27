const mongoose = require('mongoose')


const Problem = new mongoose.Schema({

    email :{
        type :String,
        required : true
    },
    Problem :{
        type :String,
        required : true
    }

})


module.exports = mongoose.model("furniture-problem",Problem)