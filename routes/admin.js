const jwt = require("jsonwebtoken")
const express = require('express')
const router = express.Router()
require("dotenv").config()

//The route for the admin to login
router.post('/login',(req,res)=>{
    const {username,password}= req.body

    if(username === "admin" && password === "admin" ){
      const token =  jwt.sign({username:username,password:password},process.env.JWT_SECRET,{})
       return  res.json({token:token})
    }else{
        return res.status(400).send("wrong username or password")
    }

})

module.exports = router