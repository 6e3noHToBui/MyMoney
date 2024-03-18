const {mongoose,ObjectId} = require('mongoose');


const ExpenseSchema = new mongoose.Schema({
    title: {type: String,required: true,trim: true,maxLength: 50},
    amount: {type: Number,required: true,maxLength: 20,trim: true},
    type: {type: String,default:"expense"},
    date: {type: Date,required: true,trim: true},
    category: {type: String,required: true,trim: true},
    description: {type: String,required: true,maxLength: 100,trim: true},
    wallet: { type: ObjectId, ref: 'Wallet', required: true },
    receipt: {type: String,default:null},
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema)