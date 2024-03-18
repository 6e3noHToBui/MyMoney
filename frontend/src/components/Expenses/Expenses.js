import React, { useEffect } from 'react'
import { useGlobalContext } from '../../context/globalContext';
import IncomeItem from '../Salary/SalaryForm';
import ExpenseForm from './ExpenseForm';
import './Expenses.modules.scss'

function Expenses() {
    const { expenses, getExpenses, deleteExpense, totalExpense } = useGlobalContext()

    useEffect(() => {
        getExpenses()
    }, [])
    return (
        <div className='expenses-container'>
            <div className='inner-expenses'>
                <h2 className="total-expenses">Total Expense: <span className='totalExpenses'>${totalExpense()}</span></h2>
                <div className="expenses-content">
                    <div className="form-container">
                        <ExpenseForm />
                    </div>
                    <div className="expenses">
                        {expenses.map((income) => {
                            const { _id, title, amount, date, category, description, type } = income;
                            console.log(income)
                            return <IncomeItem
                                key={_id}
                                id={_id}
                                title={title}
                                description={description}
                                amount={amount}
                                date={date}
                                type={type}
                                category={category}
                                indicatorColor="var(--color-green)"
                                deleteItem={deleteExpense}
                            />
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Expenses