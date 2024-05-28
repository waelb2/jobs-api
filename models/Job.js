const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    company:{
        type:String,
        required:[true,"Please provide a company name"],
        maxLength:50
    },
    position:{
        type:String,
        required:[true,"Please provide your position"],
        maxLength:100,
    },
    status:{
        type:String,
        enum:['interview','declined','pending']
    },
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:[true,'Please provide a user']
    }
},{timestamps:true})

module.exports = mongoose.model('Job',jobSchema)