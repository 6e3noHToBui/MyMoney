const { mongoose, Schema, model, ObjectId } = require("mongoose");

let Wallet;
try {
    Wallet = mongoose.model('Wallet');
} catch (error) {
    const WalletSchema = new mongoose.Schema({
        name:{type: String, required: true},
        users: [{ type: ObjectId, ref: 'User', required: true }],
        balance: { type: Number, default: 0 },
        incomes: [{ type: ObjectId, ref: 'Income' }],
        expenses: [{ type: ObjectId, ref: 'Expense' }],
        tasks: [{ type: ObjectId, ref: 'Task' }],
        cards: [{ type: ObjectId, ref: 'Card' }],
        checks: [{ type: ObjectId, ref: 'Check' }],
        invitationToken: [{
            token: { type: String, default: null },
            expires: { type: Date, default: null }}]
        });
    Wallet = mongoose.model('Wallet', WalletSchema);
}

module.exports = Wallet;