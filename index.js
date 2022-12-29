const { urlencoded } = require('express');
const express = require('express');
const app = express();
const connectDB = require('./connectDB/connectDb')
require('dotenv').config()
const user = require('./routes/user')
const admin = require('./routes/admin')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')
app.set('trust proxy',1)

app.use(express.json());
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(rateLimiter({
  windowMs:15*60*1000,
  max:100,
}))

app.get('/',(req,res) => {
    res.send('<a href="/attendance/enter">register</a>')
  })

app.use(express.json())

const port = process.env.PORT || 3000

app.use('/attendance',user)
app.use('/admin',admin)

const start = async () =>{
    await connectDB(process.env.Mongo_Url)
    app.listen(port,()=>{
        console.log('listening on 3000')
    })
}
start()
