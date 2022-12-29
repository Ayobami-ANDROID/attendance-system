const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../model/user')
const xlsx = require('xlsx')
const { json } = require('express')
const path = require('path')
const excel = require("./excel")
const mime = require('mime')


router.get("/", async (req, res) => {
    try {
      const users = await User.find().select('-attendance');
      res.status(201).send(users)
    } catch (error) {
      console.log("Cannot find users");
    }
  });

router.post('/createUser', async(req,res)=>{
 
  
  const {firstname,lastname,regNo,Subunit,Gender,phoneNo,level,hall,roomNO,webmail,department,matricNo,month,year,date,}= req.body

  const use = await User.findOne({regNo:regNo,matricNo:matricNo})
  try {
    
    if(!use){
      
      if(!firstname || !lastname || !regNo || !level ||!hall || ! roomNO || !webmail || !department || !Subunit || !Gender ||!matricNo ){
     
       return res.status(400).send('all fields are required')
    }else{
      
      const data ={
        month:month,
        year:year,
        date:date
      }
     
      const user = await User.create(req.body)
      user.dobs.push(data)
      await user.save()
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

router.delete('/deleteUser/:id', async(req,res)=>{
  try {
    const user = await User.findByIdAndDelete({_id:req.params.id})
    if(!user){
        res.status(400).send('This user does exist')
    }
    res.status(200).send('user has been deleted')
    
  } catch (error) {
    console.log(error)
  }
    
    
})

router.post("/enter", async (req, res) => {
  const monthNames = ["january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];
const dayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
  const date = new Date()
const {regNo} = req.body
 
  
    try {
      const data = {
        entry: Date.now(),
        month:monthNames[date.getMonth()],
        date:date.getDate(),
        day:dayNames[date.getDay()],
        year: date.getFullYear()
    
      };
      const user = await User.findOne({regNo:regNo});
      // console.log(user)
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
           return res.status(400).send( "You have signed in today already");
            
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

  router.get('/getAttandanceJson',async(req,res)=>{
    try {
      let {month,year,date} = req.query
      year = Number(year)
      date = Number(date)
      const totalAttendance = await User.find({attendance:{ $elemMatch:{month:month.toLowerCase(),date:date,year:year}}}).select("-attendance -_id -__v")
      if(!totalAttendance){
        return res.send(`no attendance:${date},${month},${year}`)
       }
       res.status(200).json({totalAttendance})
      
      
    } catch (error) {
      console.log(error)
    }

  })

  router.get('/getallattendance', async (req,res)=>{
    try {
      let {month,year,date} = req.query
     year = Number(year)
     date = Number(date)
   const totalAttendance = await User.find({attendance:{ $elemMatch:{month:month.toLowerCase(),date:date,year:year}}}).select("-attendance -_id -__v")
   var attendance = JSON.stringify(totalAttendance)
   attendance = JSON.parse(attendance)
   console.log(attendance)
   if(!totalAttendance){
    return res.send(`no attendance:${date},${month},${year}`)
   }
   excel(attendance,date,month,year)
   const file = path.join(__dirname,`attendance ${date}-${month}-${year}.xlsx`)
   const fileName = path.basename(file)
   const mimeType = mime.getType(file)
   res.setHeader("Content-Disposition","attachment; filename=" + fileName)
   res.setHeader("Content-Type",mimeType)
   res.download(file)
   
   
      
    } catch (error) {
      console.log(error)
    }
    
   
  })

 

module.exports = router