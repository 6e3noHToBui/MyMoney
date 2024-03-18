const {model, Schema, ObjectId} = require('mongoose')


const CardSchema = new Schema({
    name: {type: String, required: true},
    code: { type: String, required: true},
    wallet: { type: ObjectId, ref: 'Wallet'},
    user: { type: ObjectId, ref: 'User'},
    date: { type: Date, default: Date.now() },
})

module.exports = model('Card', CardSchema)