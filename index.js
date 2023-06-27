const express = require('express')
const cors = require('cors')
const jwd = require('jsonwebtoken')
var cookieParser = require('cookie-parser')

require('dotenv').config();
require('./conn/dbconn')
const signup =require('./conn/signup')
const login = require('./conn/login')
const product = require('./conn/product')
const Problem = require('./conn/help')

const {hashPass,logPas}=require('./conn/hashing')





const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())


//  for  signup 
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


//for login
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

//for adding products

app.post('/products/:email',async(req,res)=>{
    
    const { email } = req.params;
    const requestBody = req.body;  //email is extracted from req.params and the remaing fields are separated by spread operator
    const datas = new product({
        email: email,
        ...requestBody
      });
    let data = await datas.save()
    console.log(data)
    res.send(data)

})


//help 
app.post('/problem/:email',async(req,res)=>{
    const {email} = req.params
    const requestBody = req.body;
    let data = new Problem({email:email,...requestBody}) 
    let datas = await data.save()
    console.log(datas)
    res.send(datas)
})


//getting products data for view order
app.get('/get-products/:email', async(req, res) => {
    
    console.log(req.params.email)
    let data = await product.find({ email :req.params.email})
    
    if (data.length > 0) {
        res.send(data)
        console.log(data)
    } else {
        res.send('this is invalid user')
    }
})

// update the product data
app.put('/update/:_id', async(req, res) => {
    
    console.log(req.params._id)
    let data = await product.updateOne({_id:req.params._id },{ $set:{ email : req.body.email,  Productname:req.body.Productname, Category:req.body.Category, Productbrand:req.body.Productbrand, Price:req.body.Price} })   
    console.log(data)
    res.send(data)
    
})

//getting the data for showing in update

app.get('/get-update/:_id',async(req,res)=>{

    console.log(req.params)
    let data = await product.findOne({_id:req.params._id})
    if(data)
    {
        res.send(data)
    }else return res.send('err')
})


//delete product

app.delete('/delete/:_id', async(req,res)=>{

    let data = await product.deleteOne({_id : req.params._id})
    if(data)
    {
        res.send(data)
    }else return res.send('err')
})



app.listen(3004,(err,succes)=>{
    if(err) return console.log("not connected")
    else return console.log("connected")
})




