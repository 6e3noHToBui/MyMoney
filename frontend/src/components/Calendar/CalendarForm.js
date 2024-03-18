import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus } from '../../utils/Icons';
import "./CalendarForm.modules.scss"

function CalendarForm({ selectedDate, position, onClose, active, setActive }) {
    const { addTask, getTasks } = useGlobalContext();

    const [inputState, setInputState] = useState({
        title: '',
        startDate: selectedDate,
        endDate: selectedDate,
        description: '',
        number: '',
        method: 'month',
        notification: false
    });

    const [error, setError] = useState('');

    useEffect(() => {
        setInputState((prevState) => ({
            ...prevState,
            startDate: selectedDate,
            endDate: selectedDate,
        }));
        setError('');
    }, [selectedDate]);

    const { title, startDate, endDate, description, number, method, notification } = inputState;

    const handleInput = (name) => (e) => {
        setInputState({ ...inputState, [name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !startDate || !endDate || !description) {
            setError('Please fill in all fields.');
            return;
        }

        await addTask(inputState);
        getTasks();
        onClose();
    };

    return (
        <div>
            {error && <p className='error'>{error}</p>}
            <div className="container-form">
                <div className="input-control">
                    <textarea
                        name="title"
                        value={title}
                        placeholder="Add A Reference"
                        id="title"
                        cols="30"
                        rows="1"
                        onChange={handleInput('title')}
                    ></textarea>
                </div>
                <div className="input-control">
                    <DatePicker
                        id="startDate"
                        placeholderText="Enter start Date"
                        selected={startDate}
                        dateFormat="dd/MM/yyyy"
                        onChange={(date) => {
                            setInputState({
                                ...inputState,
                                startDate: date,
                                endDate: date > endDate ? date : endDate,
                            });
                        }}
                    />
                </div>
                <div className="input-control">
                    <DatePicker
                        id="endDate"
                        placeholderText="Enter end Date"
                        selected={endDate}
                        dateFormat="dd/MM/yyyy"
                        onChange={(date) => {
                            setInputState({ ...inputState, endDate: date });
                        }}
                    />
                </div>
                <div className="input-control">
                    <text>If you need notification check-in box</text>
                    {notification && (
                        <>
                            <input
                                type='number'
                                placeholder='Number (Max 31)'
                                value={number}
                                onChange={(e) => {
                                    const enteredValue = e.target.value;
                                    if (enteredValue <= 31 && enteredValue >= 0) {
                                        setInputState({ ...inputState, number: enteredValue });
                                    }
                                }}
                                max={31}
                            />
                            <select
                                value={method}
                                onChange={(e) => setInputState({ ...inputState, method: e.target.value })}
                            >
                                    <option value='day'>Day</option>
                                    <option value='week'>Week</option>
                                    <option value='month'>Month</option>
                            </select>
                        </>
                    )}
                    <input
                        type="checkbox"
                        checked={notification}
                        onChange={() => setInputState({ ...inputState, notification: !notification })}
                    />
                </div>
                <div className="input-control">
                    <textarea
                        name="description"
                        value={description}
                        placeholder="Add A Reference"
                        id="description"
                        cols="30"
                        rows="4"
                        onChange={handleInput('description')}
                    ></textarea>
                </div>
                <div className="submit-btn">
                    <Button
                        type="submit"
                        name="Add Task"
                        icon={plus}
                        bPad=".8rem 1.6rem"
                        bRad="30px"
                        bg="#4F6F52"
                        color="#fff"
                        onClick={handleSubmit}
                    />
                    <Button
                        type="close"
                        name="Close"
                        icon={plus}
                        bPad=".6rem 1.2rem"
                        bRad="20px"
                        bg="#4F6F52"
                        color="#fff"
                        onClick={onClose}
                        className="close-btn"
                    />
                </div>
            </div>
        </div>
    );
}

export default CalendarForm;


