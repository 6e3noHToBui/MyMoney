const TaskSchema = require("../models/Task")
const User = require("../models/User");

exports.addTask = async (req, res) => {
    const { title, description, startDate, endDate, number, notification, method } = req.body;
    const userId = req.user.id;

    try {
        if (!title || !description || !startDate || !endDate) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;
        const userWallet = user.wallets.find(wallet => wallet._id.equals(activeWalletId));

        if (!userWallet) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }
        const task = new TaskSchema({
            title,
            description,
            startDate,
            endDate,
            number,
            method,
            notification,
            user: user._id,
            wallet: activeWalletId
        });

        await task.save();

        user.tasks.push(task._id)
        await user.save()
        userWallet.tasks.push(task._id);
        await userWallet.save();

        res.status(200).json({ message: 'Task Added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


exports.getTasks = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;
        const userWallet = user.wallets.find(wallet => wallet._id.equals(activeWalletId));

        if (!userWallet) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }

        const tasks = await TaskSchema.find({ wallet: activeWalletId }).sort({ createdAt: -1 });
        console.log('Task:', tasks);
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error in getTasks:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteTask = async (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;
        const userWallet = user.wallets.find(wallet => wallet._id.equals(activeWalletId));

        if (!userWallet) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }

        const task = await TaskSchema.findOne({ _id: taskId, wallet: activeWalletId });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await TaskSchema.findByIdAndDelete(taskId);
        res.status(200).json({ message: 'Task Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};