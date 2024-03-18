const Card = require('../models/Card');
const User = require('../models/User');
const Wallet = require('../models/User');

exports.addCard = async (req, res) => {
    const { name, code } = req.body;
    const userId = req.user.id;

    try {
        if (!name || !code) {
            return res.status(400).json({ message: 'Name and code are required!' });
        }

        const user = await User.findById(userId).populate({ path: 'wallets', populate: { path: 'cards' } });
        const activeWalletId = user.activeWallet;
        if (activeWalletId == null){
            const cardData={
                name,
                code,
                user: user._id
            }
            const card = new Card(cardData);
            await card.save();

            user.cards.push(card._id);
            await user.save();
            res.status(200).json({ message: 'Card Added to user', cardId: card._id });
        } 
        else{
            const cardData={
                name,
                code,
                wallet: activeWalletId
            }
            const card = new Card(cardData);
            await card.save();

            const wallet = await Wallet.findById(activeWalletId)
            wallet.push(card._id)
            await wallet.save();

            res.status(200).json({ message: 'Card Added to wallet', cardId: card._id });
        }
    } catch (error) {
        console.error('Error in addCard:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCards = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId)
            .populate({ path: 'wallets', populate: { path: 'cards' } })
            .populate('cards');

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            const userCards = user.cards;
            res.status(200).json({ cards: userCards });
        } else {
            const userWallet = user.wallets.find(wallet => wallet._id.equals(activeWalletId));
            if (!userWallet) {
                return res.status(404).json({ message: 'User wallet not found!' });
            }

            const cards = userWallet.cards;
            res.status(200).json({ cards });
        }
    } catch (error) {
        console.error('Error in getCards:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteCard = async (req, res) => {
    const cardId = req.params.id;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate({ path: 'wallets', populate: { path: 'cards' } });
        const activeWalletId = user.activeWallet;

        if (!activeWalletId) {
            const userCard = user.cards.find(c => c._id.equals(cardId));
            if (!userCard) {
                return res.status(404).json({ message: 'Card not found' });
            }

            await Card.findByIdAndDelete(cardId);
            user.cards = user.cards.filter(c => !c._id.equals(cardId));
            await user.save();

            res.status(200).json({ message: 'Card Deleted' });
        } else {
            const userWallet = user.wallets.find(wallet => wallet._id.equals(activeWalletId));
            if (!userWallet) {
                return res.status(404).json({ message: 'User wallet not found!' });
            }

            const card = userWallet.cards.find(c => c._id.equals(cardId));
            if (!card) {
                return res.status(404).json({ message: 'Card not found' });
            }

            await Card.findByIdAndDelete(cardId);
            userWallet.cards = userWallet.cards.filter(c => !c._id.equals(cardId));
            await userWallet.save();

            res.status(200).json({ message: 'Card Deleted' });
        }
    } catch (error) {
        console.error('Error in deleteCard:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

