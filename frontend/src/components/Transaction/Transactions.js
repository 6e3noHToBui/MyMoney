import React, { useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import './Transaktions.modules.scss';

function Transactions() {
    const { transactionHistory } = useGlobalContext();
    const [...history] = transactionHistory();
    const [selectedExpense, setSelectedExpense] = useState(null);

    const handleExpenseClick = (receipt) => {
        setSelectedExpense((prev) => (prev === receipt ? null : receipt));
    };

    return (
        <div className='transaction-section'>
            <h2>Recent History</h2>
            {history.map((item) => {
                const { _id, title, amount, type, receipt } = item;

                return (
                    <div key={_id} className="history-item">
                        <div className="history-content" onClick={() => type === 'expense' && handleExpenseClick(receipt)}>
                            <p className="title" style={{ color: type === 'expense' ? 'black' : 'green' }}>
                                {title}
                            </p>

                            <p className="amount" style={{ color: type === 'expense' ? 'black' : 'green' }}>
                                {type === 'expense' ? `-${amount <= 0 ? 0 : amount}` : `+${amount <= 0 ? 0 : amount}`}
                            </p>
                        </div>

                        {selectedExpense === receipt && (
                            <div className="expense-image">
                                <img src={selectedExpense} alt="Expense Receipt" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}



export default Transactions;
