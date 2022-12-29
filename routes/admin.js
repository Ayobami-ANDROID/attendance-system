const jwt = require("jsonwebtoken")
const express = require('express')
const router = express.Router()
require("dotenv").config()


router.post('/login',(req,res)=>{
    const {username,password}= req.body

    if(username === "admin" && password ==="admin"){
      const token =  jwt.sign({username:username,password:password},process.env.JWT_SECRET,{expiresIn:process.env.JWT_LIFETIME})
        res.json({token:token})
    }
})

module.exports = router