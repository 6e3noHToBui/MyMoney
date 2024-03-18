const {mongoose,ObjectId} = require('mongoose');


const CheckSchema = new mongoose.Schema({
    wallet: { type: ObjectId, ref: 'Wallet', required: true },
    receipt: {type: String, default: null}
});

module.exports = mongoose.model('Check', CheckSchema)