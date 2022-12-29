const jwt = require('jsonwebtoken')
require("dotenv").config()

const auth = async (req,res,next) =>{
    const authHeader = req.headers.authorization
    if (!authHeader) {
       return res.status(400).send("not authorized to route")
    }
    const token = authHeader.split(' ')[1]
    try {
        jwt.verify(token,process.env.JWT_SECRET)
        next()
    } catch (error) {
        res.status(400).send("not authorized to route")
    }
}

module.exports = auth