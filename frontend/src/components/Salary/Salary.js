import { React, useEffect, useState } from 'react'
import { useGlobalContext } from '../../context/globalContext'
import Form from '../Form/Form'
import './Salary.modules.scss'
import IncomeItem from './SalaryForm';


function Income() {
    const { addIncome, incomes, getIncomes, deleteIncome, totalIncome } = useGlobalContext()

    useEffect(() => {
        getIncomes()
    }, [])
    return (
        <div className='income-container'>
            <div className='inner-income'>
                <h2 className="total-income">Total Salary: <span className='totalIncome'>${totalIncome()}</span></h2>
                <div className='inner-content'>
                    <div className="form-container">
                        <Form />
                    </div>
                    <div className="incomes">
                        {incomes.map((income) => {
                            const { _id, title, amount, date, category, description, type } = income;
                            return <IncomeItem
                                key={_id}
                                id={_id}
                                title={title}
                                description={description}
                                amount={amount}
                                date={date}
                                type={type}
                                category={category}
                                deleteItem={deleteIncome}
                            />
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Income