const CheckSchema = require("../models/Check");
const User = require("../models/User");
const Wallet = require("../models/Wallet")
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

exports.addCheck = async (req, res) => {
    const userId = req.user.id;
    try{
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }
        const params = {
            Bucket: config.get("s3Bucket"),
            Key: `checks/${uuidv4()}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };
        
        const uploadResult = await s3Upload(params);
        const imageUrl = uploadResult.Location;
    
        const check = new CheckSchema({
            wallet: activeWalletId,
            receipt: imageUrl
        });
        await check.save()

        const userWallet = user.wallets.find(wallet => wallet._id.equals(activeWalletId));
        if (userWallet) {
            userWallet.checks.push(check._id);
            await userWallet.save();
        }

        res.status(200).json({ message: 'Check Added' });
    }catch (error) {
        console.error('Error in addCheck:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.getChecks = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('wallets');
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            return res.status(404).json({ message: 'User wallet not found!' });
        }
        const checks = await CheckSchema.find({ wallet: activeWalletId });

        const checkUrls = checks.map(check => check.receipt);

        console.log('Check URLs:', checkUrls);
        res.status(200).json(checkUrls);
    } catch (error) {
        console.error('Error in getChecks:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};