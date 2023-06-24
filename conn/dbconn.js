const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/srini').then((succcess)=>{console.log('database connect')})
.catch((err)=>{console.log('error')})

