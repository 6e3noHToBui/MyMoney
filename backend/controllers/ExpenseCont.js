const ExpenseSchema = require("../models/Expense");
const User = require("../models/User");
const CheckSchema = require("../models/Check");
const config = require("config")
const { promisify } = require('util');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    accessKeyId: config.get("awsId"),
    secretAccessKey: config.get("awsKey"),
    region: config.get("region"),
});

const s3 = new AWS.S3();
const s3Upload = promisify(s3.upload).bind(s3);

exports.addExpense = async (req, res) => {
    const { title, amount, category, description, date } = req.body;
    const userId = req.user.id;
    const receipt = req.file;

    try {
        if (!title || !category || !description || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }
        const userWallet = user.wallets.find(wallet => wallet._id.equals(activeWalletId));
        const expense = new ExpenseSchema({
            title,
            amount: parsedAmount,
            category,
            description,
            date,
            wallet: activeWalletId,
        });

        if (receipt) {
            const params = {
                Bucket: config.get("s3Bucket"),
                Key: `checks/${uuidv4()}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };
            
            const uploadResult = await s3Upload(params);
            const imageUrl = uploadResult.Location;
            
            expense.receipt=imageUrl

            const check = new CheckSchema({
                wallet: activeWalletId,
                receipt: imageUrl
            });
            await check.save()
            
            userWallet.checks.push(check._id);
            await userWallet.save();
        }
        
        await expense.save();
        if (!userWallet) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }

        userWallet.expenses.push(expense._id);
        await userWallet.save();

        res.status(200).json({ message: 'Expense Added' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getExpenses = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }

        const expenses = await ExpenseSchema.find({ wallet: activeWalletId._id }).sort({ createdAt: -1 });
        console.log('Expenses:', expenses);
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error in getExpenses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }

        const expense = await ExpenseSchema.findOne({ _id: expenseId, wallet: activeWalletId._id });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await ExpenseSchema.findByIdAndDelete(expenseId);
        res.status(200).json({ message: 'Expense Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
