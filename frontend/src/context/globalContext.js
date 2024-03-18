import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:5000/api/v1/";
const token = localStorage.getItem('token');

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children }) => {
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [checks, setChecks] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);

    const addIncome = async (income) => {
        try {
            income.amount = parseFloat(income.amount);
    
            console.log('Sending income data:', income);
            const response = await axios.post(`${BASE_URL}add-income`, income, { headers: { Authorization: `Bearer ${token}`  }});
            getIncomes();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred';
            setError(errorMessage);
        }
    };

    const getIncomes = async () => {
        try {
            const response = await axios.get(`${BASE_URL}get-incomes`, { headers: { Authorization: `Bearer ${token}` } });
            setIncomes(response.data);
            console.log(response.data);
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    const deleteIncome = async (id) => {
        try {
            const res = await axios.delete(`${BASE_URL}delete-income/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            getIncomes();
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    const totalIncome = () => {
        let totalIncome = 0;
        incomes.forEach((income) => {
            totalIncome = totalIncome + income.amount;
        });

        return totalIncome;
    };

    const addExpense = async (expense) => {
        try {
            expense.amount = parseFloat(expense.amount);
    
            if (isNaN(expense.amount)) {
                throw new Error('Amount must be a valid number!');
            }
            const formData = new FormData();
            formData.append('title', expense.title);
            formData.append('amount', expense.amount);
            formData.append('date', expense.date);
            formData.append('category', expense.category);
            formData.append('description', expense.description);
            formData.append('receipt', expense.receipt);
    
            const response = await axios.post(`${BASE_URL}add-expense`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            getExpenses();
        } catch (err) {
            setError(err.message);
        }
    };

    const getExpenses = async () => {
        try {
            const response = await axios.get(`${BASE_URL}get-expenses`, { headers: { Authorization: `Bearer ${token}` } });
            console.log('Expenses on frontend:', response.data);
            setExpenses(response.data);
        } catch (err) {
            console.error('Error in getExpenses on frontend:', err);
            setError(err.response.data.message);
        }
    };

    const deleteExpense = async (id) => {
        try {
            const res = await axios.delete(`${BASE_URL}delete-expense/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            getExpenses();
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    const totalExpense = () => {
        let totalExpense = 0;
        expenses.forEach((expense) => {
            totalExpense = totalExpense + expense.amount;
        });

        return totalExpense;
    };

    const totalBalance = () => {
        return totalIncome() - totalExpense();
    };

    const transactionHistory = () => {
        const history = [...incomes, ...expenses];
        history.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return history.slice(0, 3);
    };
    
    const getTasks = async () => {
        try {
            const response = await axios.get(`${BASE_URL}get-tasks`, { headers: { Authorization: `Bearer ${token}` } });
            console.log('Tasks from server:', response.data);
            setTasks(response.data);
        } catch (err) {
            console.error('Error in getTasks on frontend:', err);
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    const addTask = async (task) => {
        try {    
            console.log('Sending Task data:', task);
            const response = await axios.post(`${BASE_URL}add-task`, task, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred';
            setError(errorMessage);
        }
    };
    const deleteTask = async (id) => {
        try {
            const res = await axios.delete(`${BASE_URL}delete-task/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    const getChecks = async () => {
        try {
            const response = await axios.get(`${BASE_URL}get-checks`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (err) {
            console.error('Error in getChecks on frontend:', err);
            setError(err.response?.data?.message || 'Unknown error');
            return [];
        }
    };

    const addCheck = async (check) =>{
        try{
            const response = await axios.post(`${BASE_URL}add-check`, check, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (err) {
            console.error('Error in addCheck on frontend:', err);
            setError(err.response?.data?.message || 'Unknown error');
            return [];
        }
    }

    return (
        <GlobalContext.Provider
            value={{
                addIncome,
                getIncomes,
                incomes,
                deleteIncome,
                expenses,
                totalIncome,
                addExpense,
                getExpenses,
                deleteExpense,
                totalExpense,
                totalBalance,
                transactionHistory,
                addTask,
                getTasks,
                deleteTask,
                addCheck,
                getChecks,
                error,
                setError
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};
