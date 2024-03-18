const router = require('express').Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const authMiddleware = require('../middleware/auth.middleware');
const { createWallet, addUserToWallet, acceptInvite, getUserWallets, setActiveWallet, unsetActiveWallet,deleteUserFromWallet, getUsersInWallet } = require('../controllers/WalletCont');
const { addExpense, getExpenses, deleteExpense } = require('../controllers/ExpenseCont');
const { addIncome, getIncomes, deleteIncome } = require('../controllers/IncomeCont');
const { addTask, getTasks, deleteTask } = require("../controllers/TaskCont");
const { registration, login, auth, verification, editProfile } = require('../controllers/UserCont');
const { addCard, deleteCard, getCards} = require('../controllers/CardCont');
const { getChecks, addCheck } = require('../controllers/CheckCont');

//User
router.post('/registration',upload.single('avatar'), registration)
router.post('/login',login)
router.get('/auth',authMiddleware, auth)
router.get('/verify/:token*',verification)
router.post('/edit-profile',authMiddleware,upload.single('avatar'), editProfile)
//Income
router.post('/add-income',authMiddleware, addIncome);
router.delete('/delete-income/:id', authMiddleware,deleteIncome);
router.get('/get-incomes',authMiddleware, getIncomes);

//Expense
router.post('/add-expense', authMiddleware,upload.single('receipt'), addExpense);
router.get('/get-expenses',authMiddleware, getExpenses);
router.delete('/delete-expense/:id',authMiddleware,deleteExpense);

//Check
router.post('/add-check',authMiddleware,upload.single('receipt'), addCheck);
router.get('/get-checks',authMiddleware, getChecks);

//Card
router.post('/add-card', authMiddleware, addCard);
router.get('/get-cards', authMiddleware, getCards);
router.delete('/delete-card/:id', authMiddleware, deleteCard);

//Wallet
router.post('/create-wallet', authMiddleware, createWallet);
router.post('/add-user-to-wallet', authMiddleware, addUserToWallet)
router.get('/accept-invite/:token*', acceptInvite)
router.get('/get-user-wallets', authMiddleware, getUserWallets)
router.post('/set-active-wallet',authMiddleware, setActiveWallet)
router.post('/unset-active-wallet',authMiddleware, unsetActiveWallet)
router.post('/delete-user-from-wallet',authMiddleware, deleteUserFromWallet)
router.get('/get-users-in-wallet',authMiddleware, getUsersInWallet)

//Task
router.post('/add-task',authMiddleware, addTask);
router.get('/get-tasks',authMiddleware, getTasks);
router.delete('/delete-task/:id',authMiddleware, deleteTask);

module.exports = router;
