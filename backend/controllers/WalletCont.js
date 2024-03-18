const Wallet = require("../models/Wallet")
const User = require("../models/User")
const nodemailer = require('nodemailer');
const config = require("config")
const crypto = require('crypto');

exports.createWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, amount } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!name || !amount ) {
      return res.status(400).json({ success: false, error: 'Both name and amount are required' });
    }
    if (isNaN(parsedAmount)) {
        return res.status(400).json({ message: 'Amount must be a number!' });
    } else if (parsedAmount < 0) {
        return res.status(400).json({ message: 'Amount must be a positive number!' });
    }

    const wallet = new Wallet({
      name: name,
      users: [userId],
      balance: amount,
      incomes: [],
      expenses: [],
      tasks: [],
      cards: [],
    });

    await wallet.save();

    const user = await User.findById(userId);
    user.wallets.push(wallet._id);
    user.wallet = wallet._id;
    await user.save();

    console.log('Wallet created successfully');
    res.status(200).json({ success: true, walletId: wallet._id });
  } catch (error) {
    console.error('Error creating wallet:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.addUserToWallet = async (req, res) => {
  try {
    const { login } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activeWalletId = user.activeWallet;
    const wallet = await Wallet.findById(activeWalletId);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }

    const newUser = await User.findOne({ login });

    if (!newUser) {
      return res.status(404).json({ message: 'User for added not found' });
    }

    if (wallet.users.includes(newUser._id)) {
      return res.status(400).json({ message: 'User is now exist into wallet' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    newUser.invitationToken = [{
      token,
      expires: expirationDate
    }];

    await newUser.save();

    wallet.invitationToken = [{
      token,
      expires: expirationDate
    }];
    await wallet.save()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.get("EMAIL"),
        pass: config.get("EMAIL_PASSWORD"),
      },
    });

    const inviteLink = `http://localhost:3000/accept-invite/${token}`;

    const mailOptions = {
      from: 'mymoney@gmail.com',
      to: newUser.email,
      subject: 'Invite to wallets',
      text: `You have a new invite into ${wallet.name} wallet. For acceptance, open this link: ${inviteLink}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Invite send')
    return res.status(200).json({ message: 'Invite to wallet send success' });
  } catch (error) {
    console.error('Error add user to wallet:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserWallets = async (req, res) => {
  const userId = req.user.id;
  try {
    console.log('userid:',userId)
    const user = await User.findById(userId).populate('wallets');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userWallets = user.wallets.map(wallet => ({
      name: wallet.name,
      amount: wallet.balance,
      walletId: wallet._id
    }));
    console.log('userWallets:', userWallets);

    res.status(200).json({ userWallets });
  } catch (error) {
    console.error('Error getting user wallet IDs:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.setActiveWallet = async (req, res) => {
  const userId = req.user.id;
  const walletId = req.body.walletId;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const wallet = user.wallets.find(w => w._id.toString() === walletId);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    user.activeWallet = wallet._id;
    user.save();

    res.status(200).json({ message: 'Active wallet set successfully' });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.unsetActiveWallet = async (req, res) => {
  const userId = req.user.id;
  console.log('userId:', userId);

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const wallet = user.activeWallet;

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    user.activeWallet = null
    user.save();

    res.status(200).json({ message: 'Active wallet unset successfully' });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteUserFromWallet = async (req, res) => {
  try {
    const { login } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const activeWalletId = user.activeWallet;
    const wallet = await Wallet.findById(activeWalletId);
    console.log('wallet:', wallet);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }

    const newUser = await User.findOne({ login });
    console.log('NewUser:', newUser)

    if (!newUser) {
      return res.status(404).json({ message: 'User to delete not found' });
    }

    if (!wallet.users.includes(newUser._id)) {
      return res.status(400).json({ message: 'User does not exist in the wallet' });
    }

    const userIndex = wallet.users.indexOf(newUser._id);
    wallet.users.splice(userIndex, 1);
    await wallet.save();

    if (newUser.wallets.includes(wallet._id)) {
      const walletIndex = newUser.wallets.indexOf(wallet._id);
      newUser.wallets.splice(walletIndex, 1);
      newUser.activeWallet = null
      await newUser.save();
    }

    return res.status(200).json({ message: 'User deleted from the wallet successfully' });
  } catch (error) {
    console.error('Error deleting user from wallet:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getUsersInWallet = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).populate('wallets');
    const activeWalletId = user.activeWallet;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!activeWalletId) {
      return res.status(404).json({ message: 'User wallet not found!' });
    }

    const wallet = await Wallet.findById(activeWalletId);
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found!' });
    }

    console.log('wallet.users:', wallet.users);

    const usersInWallet = await Promise.all(wallet.users.map(async (userId) => {
      const user = await User.findById(userId);
      return user ? { name: user.name, surename: user.surename, login: user.login, logo: user.avatar } : null;
    }));

    console.log('usersInWallet:', usersInWallet);

    const filteredUsersInWallet = usersInWallet.filter(user => user !== null);

    res.status(200).json({ message: 'Users in wallet', users: filteredUsersInWallet });
  } catch (error) {
    console.error('Error in get users in wallet:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const token = req.params.token;

    const invitedUser = await User.findOne({
      'invitationToken.token': token,
      'invitationToken.expires': { $gt: Date.now() },
    });

    if (!invitedUser) {
      return res.status(400).json({ message: 'Bad or expired token' });
    }
    console.log('InvitedUser:', invitedUser);

    const userWallets = await Wallet.find({
      'invitationToken.token': token,
      'invitationToken.expires': { $gt: Date.now() },
    });

    if (userWallets.length === 0) {
      return res.status(404).json({ message: 'No wallet found with the given token' });
    }

    for (const wallet of userWallets) {
      if (!wallet.users.some(userId => userId.equals(invitedUser._id))) {
        wallet.users.push(invitedUser._id);
        await wallet.save();
      }

      wallet.invitationToken = wallet.invitationToken.filter(
        (invite) => invite.token !== token
      );
      invitedUser.wallets.push(wallet._id)
      await wallet.save();
    }

    invitedUser.invitationToken = invitedUser.invitationToken.filter(
      (invite) => invite.token !== token
    );
    await invitedUser.save();
    res.status(200).json({message: 'User added to wallet'})
  } catch (error) {
    console.error('Error accept invite:', error.message);
    res.status(500).json({ message: 'ServerError' });
  }
};
