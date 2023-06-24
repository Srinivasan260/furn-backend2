const express = require('express')
const cors = require('cors')
const jwd = require('jsonwebtoken')
var cookieParser = require('cookie-parser')

require('dotenv').config();
require('./conn/dbconn')
const signup =require('./conn/signup')
const login = require('./conn/login')
const product = require('./conn/product')

const {hashPass,logPas}=require('./conn/hashing')





const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())



app.post('/signup',async(req,res)=>{

    const hashPassword = hashPass(req.body.password)
    console.log(hashPassword)
    req.body.password = hashPassword
    let data = new signup(req.body);
    let data2 =await data.save()
    if(data2){
        res.send(data2)
    }else{
        return res.send(err)
    }

})



app.post('/login',async(req,res)=>{

  if(req.body.email && req.body.password){
    
    const password= req.body.password
    const email = req.body.email

    let datas = await login.findOne({ email })
    console.log(datas.password)
    let pass = logPas(password,datas.password)
    console.log(datas)

    if(datas && pass){

        const user = {name : email}
        console.log(email)
        const token =jwd.sign(user,process.env.ACCESS_TOKEN)
        res.cookie('jwt', token, { httpOnly: true });

        datas = datas.toObject()
        delete datas.password
        console.log(datas)
        res.send(datas)
        console.log({ access_token: token })
        

     
    }else{
        res.send("err")
    }

  }

})

app.post('/products',async(req,res)=>{

    let datas = new product(req.body)
    let data = await datas.save()
    console.log(data)
    res.send(data)

})




app.listen(3004,(err,succes)=>{
    if(err) return console.log("not connected")
    else return console.log("connected")
})




