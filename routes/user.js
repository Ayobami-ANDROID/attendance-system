const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../model/user')
const xlsx = require('xlsx')
const auth = require('../middleware/auth')
const { json } = require('express')
const path = require('path')
const excel = require("./excel")
const mime = require('mime')

//The route to get all the user in the datadase
router.get("/", auth,async (req, res) => {
    try {
      const users = await User.find().select('-attendance');
      res.status(201).send(users)
    } catch (error) {
      console.log("Cannot find users");
    }
  });

 //This is the route to create a user 
router.post('/createUser', async(req,res)=>{
 
  
  const {firstname,lastname,regNo,Subunit,Gender,phoneNo,level,hall,
    roomNO,webmail,department,matricNo,dob}= req.body

   //to check is the registration Number exist in the database 
  const use = await User.findOne({regNo:regNo,matricNo:matricNo})
  try {
    
    if(!use){
      //to check if this following things is in the request body
      if(!firstname || !lastname || !regNo || !level ||!hall || ! roomNO || !webmail || !department || !Subunit || !Gender ||!matricNo ||!dob ){
     
       return res.status(400).send('all fields are required')
    }else{
      
     
      const user = await User.create(req.body)
     return res.status(200).json({user})
    }
    }else{
     return res.status(400).send('registration or matriculation number already taken')
    }
    
    
    
    // const user = await User.create(req.body)
    // res.status(200).json({user})
    
  } catch (error) {
    console.log(error)
    
  }

   
})

//this is the route to the delete a user
router.delete('/deleteUser/:id',auth, async(req,res)=>{
  try {
    const user = await User.findByIdAndDelete({_id:req.params.id})
    //to check if the user exist
    if(!user){
        res.status(400).send('This user does exist')
    }
    res.status(200).send('user has been deleted')
    
  } catch (error) {
    console.log(error)
  }
    
    
})

//This is the route to take attendace
router.post("/enter", auth,async (req, res) => {
  const monthNames = ["january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];
const dayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
  const date = new Date()
const {regNo,serviceType} = req.body
 
  
    try {
      const data = {
        entry: Date.now(),
        month:monthNames[date.getMonth()],
        date:date.getDate(),
        day:dayNames[date.getDay()],
        year: date.getFullYear(),
        serviceType:serviceType
    
      };
      let month = monthNames[date.getMonth()]
      let dat = date.getDate()
      let day = dayNames[date.getDay()]
      let year = date.getFullYear()
      const user = await User.findOne({regNo:regNo});
      // console.log(user)
      // to check if the registrration  Number does not exist
      if(!user){
       return res.send("user not found")
      }
      // console.log(user)
  
      //if the user has an attendance array;
   
      if(user.attendance && user.attendance.length > 0){
      //for a new checkin attendance, the last checkin
      //must be at least 24hrs less than the new checkin time;
          const lastCheckIn = user.attendance[user.attendance.length - 1];
          const lastCheckInTimestamp = lastCheckIn.entry.getTime()
          const day = new Date()
          console.log(day, lastCheckInTimestamp);
          if (day.getTime() > lastCheckInTimestamp + 100) {
            user.attendance.push(data);
            await user.save();
           return res.status(200).send('you have successfully signed in today')
           
            
          } else {
           if (user.attendance.includes(data)) {
            return res.status(400).send( "You have signed in today already");
           } 
           
            
          }
      }else{
          user.attendance.push(data);
          await user.save();
         return res.send('You have been signed in for today')
          // res.json(user)
      }
    
    
    } catch (error) {
      console.log("something went wrong");
      console.log(error);
    }
  });

  router.put('/updateUser/:id',async(req,res) =>{
    const user = await User.findByIdAndUpdate({_id:req.params.id},req.body,{
      new:true,runValidators:true
    })

    if(!user){
      return res.send('no user found')
    }

    res.status(201).json({msg:'user updated',user})
  })

// this is the route to get all the attendance in  json format
  router.get('/getAttandanceJson',auth,async(req,res)=>{
    try {
      //the following are required to get the attendance
      let {month,year,date,serviceType} = req.query
      year = Number(year)
      date = Number(date)
      const totalAttendance = await User.find({attendance:{ $elemMatch:{month:month.toLowerCase(),date:date,year:year,serviceType:serviceType}}}).select(" -_id -__v")
      if(!totalAttendance){
        return res.send(`no attendance for ${serviceType} (${date},${month},${year})`)
       }
       res.status(200).json({totalAttendance})
      
      
    } catch (error) {
      console.log(error)
    }

  })

  //to get all the attendance in excel format
  router.get('/getallattendance', auth,async (req,res)=>{
    try {
      //the following are required to get the attendance
      let {month,year,date,serviceType} = req.query
     year = Number(year)
     date = Number(date)
   const totalAttendance = await User.find({attendance:{ $elemMatch:{month:month.toLowerCase(),date:date,year:year,serviceType:serviceType}}}).select("-attendance -_id -__v")
   var attendance = JSON.stringify(totalAttendance)
   attendance = JSON.parse(attendance)
   console.log(attendance)
   if(!totalAttendance){
    return res.send(`no attendance:${date},${month},${year}`)
   }
   // The path function to change json into an excel format
   excel(attendance,date,month,year,serviceType)
// the path to download the excel file
   const file = path.join(__dirname,`attendance ${serviceType} (${date}-${month}-${year}).xlsx`)
   const fileName = path.basename(file)
   const mimeType = mime.getType(file)
   // setheader to be able to download attendance
   res.setHeader("Content-Disposition","attachment; filename=" + fileName)
   res.setHeader("Content-Type",mimeType)
   // the able to download the file
   res.download(file)
   
   
      
    } catch (error) {
      console.log(error)
    }
    
   
  })

 

module.exports = router