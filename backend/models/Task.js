const {Schema, model, ObjectId} = require("mongoose")

const TaskShema = new Schema({
    title: {type: String,required: true,trim: true,maxLength: 50},
    startDate: {type: Date,required: true,trim: true},
    endDate: {type: Date,required: true,trim: true},
    description: {type: String,required: true,maxLength: 200,trim: true},
    number:{type: String,trim:true},
    method:{type: String,trim:true},
    notification: {type: Boolean},
    user:{type: ObjectId,ref: 'User',required: true},
    wallet: { type: ObjectId, ref: 'Wallet', required: true }
})

module.exports = model('Task', TaskShema)