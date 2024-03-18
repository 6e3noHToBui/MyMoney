import { dashboard, expenses, settings, transactions, trend } from "./../Icons"


const menuItems = [
    {
        id: 1,
        title: 'Dashboard',
        icon: dashboard,
        link: '/dashboard'
    },
    {
        id: 2,
        title: "View Transactions",
        icon: transactions,
        link: "/transactions",
    },
    {
        id: 3,
        title: "Salary",
        icon: trend,
        link: "/income",
    },
    {
        id: 4,
        title: "Expense",
        icon: expenses,
        link: "/expenses",
    },
    {
        id: 5,
        title: "Wallet",
        icon: settings,
        link: "/UserWalletForm",
    }
]

export default menuItems