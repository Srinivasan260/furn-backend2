const express = require('express')
const cors = require('cors')
const jwd = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const bcryptotp = require('bcryptjs');



//for aws
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const crypto = require('crypto')

require('dotenv').config();
require('./conn/dbconn')
const signup =require('./conn/signup')
const login = require('./conn/login')
const product = require('./conn/product')
const Problem = require('./conn/help')

const {hashPass,logPas}=require('./conn/hashing')

const Otpverify= require('./conn/otp')





const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())



// creating traansporter

const transporter = nodemailer.createTransport({
    host: 'smtp.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: 'srinivjgnc@gmail.com',
      pass: '***',
    },
  })



//aws config
//for aws connection we have to specify the access key



aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION
  });
  
  const Bucket = process.env.BUCKET;
  
  const s3 = new aws.S3();

  // const randomBytes = (bytes = 32)=>{
  //   crypto.randomBytes(bytes).toString('hex')
  // }
  
  // const filename = new randomBytes();
  const upload = multer({
    storage: multerS3({
      
      bucket: Bucket,
      s3: s3,
      key: (req, file, cb) => {
        cb(null, file.originalname);
      }
    })
  });
  
  app.post('/post',upload.any(),async(req, res) => {
      console.log('3')
   
    // console.log(req.params)
    

    // const command= new PutObjectCommand(upload)

    //   await s3.send(command)
    res.send(req.file);
    console.log(req.file);
   


  });



//  for  signup 
app.post('/signup',async(req,res)=>{

    const hashPassword = hashPass(req.body.password)
    console.log(hashPassword)
    req.body.password = hashPassword
    let data = new signup(req.body);
    let data2 =await data.save()
    console.log(data2)

    if(data2){
        
            console.log(data2.email,data2._id)
        
        const userverify = await UserOtp(data2.email, data2._id,res)
        console.log(data2)
    
       return  res.send(data2._id);
   
    }else{
        return res.json({ messadge: 'Signup Invalid' })
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


// email verification 

const UserOtp =async(email,_id,res)=>{

try{
    const Otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(Otp)

    const mailDetails ={
        from : 'srinivjgnc@gmail.com',
        to : email,
        Subject: 'SR furn mail id verfication ',
        html : `<p>Your ${Otp}  for SR Furn app login..Dont share this</p> `
    }
    console.log('5')

    const otpdata =  new Otpverify({
        userId : _id,
        Otp : Otp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 360000,


    })

     await otpdata.save()

    transporter.sendMail(mailDetails);
   
}catch(err){
   return  res.json({mesage : err.message})
}
}

app.post('/verify-otp', async(req,res)=>{

    try{
        
          
        let {userId,Otp} =req.body
        
        console.log(userId ,Otp)

        if(!userId && !Otp){
            return res.json (' enter the otp and userID')


        }else{

            const findOTp = await Otpverify.find({userId})
            console.log(findOTp)
           

            if(!findOTp.data <= 0){
                return res.json ('enter the valid OTp')

            }else{
                const{expiresAt} = findOTp[0]
                const hashOtp = findOTp[0].Otp;
                console.log(expiresAt)
                  if(expiresAt < Date.now()){
                    console.log('4')
                    await Otpverify.deleteOne({userId})
                    throw new error('your otp is expired')
                  }
                else{
                    console.log('5')
                    const OtpVerified = bcryptotp.compare(Otp,hashOtp)
                    console.log(OtpVerified)
           if(!OtpVerified){
            throw new error('otp is not valid')
           }else{

            await signup.updateOne({_id:userId},{verified : 'true'})
           await Otpverify.deleteMany({userId})
           res.json({
            status: "success",
            message : "User email updated successfully"
           })
          }


                }
            }
        }

    }
    catch(err){
        res.json({
            status :"failed",
            message : err.message
          })
          console.log({mesaage : err.message})
      

    }

})



app.listen(3004,(err,succes)=>{
    if(err) return console.log("not connected")
    else return console.log("connected")
})




