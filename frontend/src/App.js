import React, { useState, useEffect } from 'react';
import './styles/app.css';
import "./styles/index.scss"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./components/Autorization/Registration";
import Login from "./components/Autorization/Login";
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Main from './pages/MainPage';
import Dashboard from './components/Dashboard/Dashboard';
import Income from './components/Salary/Salary';
import Expenses from './components/Expenses/Expenses';
import Transactions from './components/Transaction/Transactions';
import Card from './components/Card/Card';
import History from './components/History/History';
import Paragon from './components/Checks/Checks';
import Settings from './components/Settings/Settings';
import Calendar from './components/Calendar/Calendar';
import UserWalletForm from './components/Wallets/UserWallet';
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../src/actions/user";
import Verification from "./components/Autorization/Verification";
import AcceptInvite from "./components/Wallets/AcceptInvite"

function App() {
    const [active, setActive] = useState(1)
    const isAuth = useSelector(state => state.user.isAuth)
    const dispatch = useDispatch()

    useEffect(() => {
        document.title = "MyMoney";
    }, []);

    useEffect(() => {
        dispatch(auth());
    }, [dispatch]);

    const displayData = () => {
        switch (active) {
            case 1:
                return <Dashboard />
            case 2:
                return <Transactions />
            case 3:
                return <Income />
            case 4:
                return <Expenses />
            case 5:
                return <UserWalletForm />
            default:
                return <Dashboard />
        }
    }


    return (
        <BrowserRouter>
            <div className='app'>
                <Header />
                <Routes>
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/transactions" element={<Home />} />
                    <Route path="/Main" element={<Main active={active} setActive={setActive} displayDataContent={displayData()} />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/card" element={<Card />} />
                    <Route path="/paragon" element={<Paragon />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/setting" element={<Settings />} />
                    <Route path="/verify/:token" element={<Verification />} />
                    <Route path="/accept-invite/:token" element={<AcceptInvite />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
