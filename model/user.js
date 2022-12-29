const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:[true,'firstname is required']
    },
    lastname:{
        type:String,
        required:[true,'lastname is required']
    },
    regNo:{
        type:String,
        required:[true,'Registration number is required'],
       

    },
    matricNo:{
        type:String,
        required:[true,'matriculation Number is required'],
       
    },
    Gender:{
        type:String,
        required:[true,'Gender is required'],
        enum:['male','female']
    },              
    level:{
        type:Number,
        required:[true,'Level is required']
    },
    hall:{
        type:String,
        required:[true,'hall is required']
    },
    roomNO:{
        type:String,
        required:[true,'room is required']
    },
    department:{
        type:String,
        required:[true,'room is required']
    },
    webmail:{
        type:String,
        required:[true,'webmail is required']
    },
    PhoneNo:{
        type:String,
    },
    Subunit:{
        type:String,
        required:[true,'subunit is required'],
        enum:['follow-up','media','welfare']
    },
    dob:{
        type:String,
        required:[true,'date of birth is required']
    },

    attendance:[
        {
           
            entry:{type:Date},
            month:{
                type:String
            },
            day:{
                type:String
            },
            year:{
                type:Number
            },
            date:{
                type:Number
            },
            serviceType :{
                type:String,
                enum:['tuesday preservice','thursday preservice',
                'thursday prayer meeeting', 'saturday meeting','sunday preservice']
            }

        }
    ]

})

module.exports = mongoose.model('user',userSchema)