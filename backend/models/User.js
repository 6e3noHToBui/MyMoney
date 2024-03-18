const { mongoose, Schema, model, ObjectId } = require("mongoose");

let UserSchema;

try {
    UserShema = model('User');
} catch (error) {
    const UserShema = new Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        login: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        surename: { type: String, required: true },
        verificationToken: { type: String },
        verificationTokenExpiry: { type: Date },
        verified: { type: Boolean, default: false },
        cards:[{type: ObjectId, ref: 'Card'}],
        avatar: { type: String, default:null },
        wallets: [{ type: ObjectId, ref: 'Wallet' }],
        activeWallet: { type: ObjectId, ref: 'Wallet' },
        tasks:[{type: ObjectId, ref:'Task'}],
        invitationToken: [{
            token: { type: String, default: null },
            expires: { type: Date, default: null }}]
        });
    User = model('User', UserShema);
}

module.exports = model('User', UserSchema);
