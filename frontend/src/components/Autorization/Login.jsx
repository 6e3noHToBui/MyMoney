import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import "./registration.css";
import Input from "../../utils/input/input";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import { setUser } from "../../reducers/userReducer";

const Login = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [notification, setNotification] = useState("");
    const [attemptedLogin, setAttemptedLogin] = useState(false);
    const [errorText, setErrorText] = useState(""); 
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuth = useSelector(state => state.user.isAuth);

    const handleLogin = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/v1/login`, {
                login,
                password
            });
    
            dispatch(setUser(response.data.user))
            localStorage.setItem('token', response.data.token)
            setAttemptedLogin(true);
        } catch (error) {
            setErrorText(error.response?.data?.message || "An error occurred.");
        }
    };

    useEffect(() => {
        if (attemptedLogin) {
            if (!isAuth) {
                setErrorText("Invalid credentials. Please check your login and password.");
            } else {
                setErrorText("");
                navigate("/main");
                window.location.reload()
            }
        }
    }, [isAuth, attemptedLogin]);

    return (
        <div className="container">
            <div className="registration">
                <div className="registration__header">Login</div>
                <Input value={login} setValue={setLogin} type="login" placeholder="Input login"/>
                <Input value={password} setValue={setPassword} type="password" placeholder="Input password"/>
                {notification && <div className="notification">{notification}</div>}
                {errorText && <div className="error-message">{errorText}</div>}
                <button className="registration__button" onClick={handleLogin}>Sign In</button>
                <div className="registration__footer">
                    <p>Dont have account? <Link to="/registration">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
