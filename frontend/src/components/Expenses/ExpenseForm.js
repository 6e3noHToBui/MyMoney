import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus } from '../../utils/Icons';
import "./ExpenseForm.modules.scss"
function ExpenseForm() {
    const { addExpense, error, setError } = useGlobalContext();

    const [inputState, setInputState] = useState({
        title: '',
        amount: '',
        date: '',
        category: '',
        description: '',
        receipt: null,
    });

    const { title, amount, date, category, description } = inputState;

    const handleInput = (name) => (e) => {
        const fileInput = e.target;
        const fileNameDisplay = document.getElementById('fileNameDisplay');

        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];

            if (file.type.startsWith('image/')) {
                setInputState((prevState) => ({ ...prevState, [name]: file }));
                setError('');
                fileNameDisplay.textContent = `File selected`;
            } else {
                e.target.value = null;
                setInputState((prevState) => ({ ...prevState, [name]: null }));
                setError('Please select a valid image file.');
                fileNameDisplay.textContent = '';
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!error) {
            addExpense(inputState);
            setInputState({
                title: '',
                amount: '',
                date: '',
                category: '',
                description: '',
                receipt: null,
            });
        }
    };

    return (
        <form className='expenses-form' onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="input-control">
                <input
                    type="text"
                    value={title}
                    name={'title'}
                    placeholder="Expense Title"
                    onChange={(e) => setInputState({ ...inputState, title: e.target.value })}
                />
            </div>
            <div className="input-control">
                <input
                    value={amount}
                    type="text"
                    name={'amount'}
                    placeholder={'Expense Amount'}
                    onChange={(e) => setInputState({ ...inputState, amount: e.target.value })}
                />
            </div>
            <div className="input-control">
                <DatePicker
                    id='date'
                    placeholderText='Enter A Date'
                    selected={date}
                    dateFormat="dd/MM/yyyy"
                    onChange={(date) => setInputState({ ...inputState, date: date })}
                />
            </div>
            <div className="selects input-control">
                <select required value={category} name="category" id="category" onChange={(e) => setInputState({ ...inputState, category: e.target.value })}>
                    <option value="" disabled >Select Option</option>
                    <option value="education">Education</option>
                    <option value="groceries">Groceries</option>
                    <option value="health">Health</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="takeaways">Takeaways</option>
                    <option value="clothing">Clothing</option>
                    <option value="travelling">Travelling</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div className="input-control">
                <textarea
                    name="description"
                    value={description}
                    placeholder='Add A Reference'
                    id="description"
                    cols="30"
                    rows="4"
                    onChange={(e) => setInputState({ ...inputState, description: e.target.value })}
                ></textarea>
            </div>
            <div className="input-control">
                <label className="file-upload">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleInput('receipt')}
                    />
                    <span>Choose file</span>
                </label>
            </div>
            {error && <p className='error'>{error}</p>}
            <div id="fileNameDisplay" style={{color: 'green', fontWeight: 'bold'}}></div>
            <div className="submit-btn">
                <Button
                    name={'Add Expense'}
                    icon={plus}
                    bPad={'.8rem 1.6rem'}
                    bRad={'10px'}
                    bg={'#2c3e50'}
                    color={'#fff'}
                />
            </div>
        </form>
    );
}

export default ExpenseForm