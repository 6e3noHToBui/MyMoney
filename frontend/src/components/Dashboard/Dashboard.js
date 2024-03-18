import React, { useEffect } from 'react'
import { useGlobalContext } from '../../context/globalContext';
import History from '../Transaction/Transactions';
import { dollar } from '../../utils/Icons';
import Chart from '../Chart/Chart';
import "./Dashboard.modules.scss";
import { useSelector } from "react-redux";


function Dashboard() {
    const { totalExpense, incomes, expenses, totalIncome, totalBalance, getIncomes, getExpenses } = useGlobalContext()
    const isAuth = useSelector(state => state.user.isAuth);

    useEffect(() => {
        getIncomes()
        getExpenses()
    }, [])

    return (
        <div className='dashboard-container'>
            <div className="stats-con">
                <div className="chart-con">
                    <Chart />
                    <div className="amount-con">
                        <div className="income">
                            <h2>Total Salary</h2>
                            <p>
                                {dollar} {totalIncome()}
                            </p>
                        </div>
                        <div className="expense">
                            <h2>Total Expense</h2>
                            <p>
                                {dollar} {totalExpense()}
                            </p>
                        </div>
                        <div className="balance">
                            <h2>Total Balance</h2>
                            <p>
                                {dollar} {totalBalance()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="history-con">
                    <History />
                    <h2 className="salary-title">Min <span>Salary</span>Max</h2>
                    <div className="salary-item">
                        <p>
                            ${incomes.length > 0 ? Math.min(...incomes.map(item => item.amount)) : 0}
                        </p>
                        <p>
                            ${incomes.length > 0 ? Math.max(...incomes.map(item => item.amount)) : 0}
                        </p>
                    </div>
                    <h2 className="salary-title">Min <span>Expense</span>Max</h2>
                    <div className="salary-item">
                        <p>
                            ${expenses.length > 0 ? Math.min(...expenses.map(item => item.amount)) : 0}
                        </p>
                        <p>
                            ${expenses.length > 0 ? Math.max(...expenses.map(item => item.amount)) : 0}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}



export default Dashboard