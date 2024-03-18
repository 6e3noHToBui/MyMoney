const IncomeSchema= require("../models/Income")
const User = require("../models/User");

exports.addIncome = async (req, res) => {
    const { title, amount, category, description, date } = req.body;
    const userId = req.user.id;

    try {
        if (!title || !category || !description || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
        if (amount <= 0 || typeof amount !== 'number') {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            return res.status(404).json({ message: 'Active wallet not found!' });
        }

        const income = new IncomeSchema({
            title,
            amount,
            category,
            description,
            date,
            wallet: activeWalletId,
        });

        await income.save();

        const userWallet = user.wallets.find(wallet => wallet._id.equals(activeWalletId));
        userWallet.incomes.push(income._id);
        await userWallet.save();

        res.status(200).json({ message: 'Income Added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getIncomes = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }

        const incomes = await IncomeSchema.find({ wallet: activeWalletId._id }).sort({ createdAt: -1 });
        console.log('Incomes:', incomes);
        res.status(200).json(incomes);
    } catch (error) {
        console.error('Error in getIncomes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteIncome = async (req, res) => {
    const incomeId = req.params.id;
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }

        const income = await IncomeSchema.findOne({ _id: incomeId, wallet: activeWalletId._id });

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        await IncomeSchema.findByIdAndDelete(incomeId);
        res.status(200).json({ message: 'Income Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};