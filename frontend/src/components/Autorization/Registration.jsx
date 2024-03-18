import React, { useState } from "react";
import axios from "axios";
import "./registration.css";
import Input from "../../utils/input/input";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surename, setSureName] = useState("");
  const [login, setLogin] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegistration = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/v1/registration`, {
        email,
        login,
        name,
        surename,
        password,
      });
  
      console.log("Response status:", response.status);
  
      if (response.data.message === 'User registration successful. Please check your email for verification.') {
        setIsRegistrationSuccess(true);
        setTimeout(() => {
          setIsRegistrationSuccess(false);
          window.close()
        }, 5000);
      }
    } catch (error) {
      console.error("Registration error:", error);
  
      if (error.response && error.response.data && error.response.data.errors) {
        setValidationErrors(error.response.data.errors.map(error => error.msg));
      } else if (error.response && error.response.data && error.response.data.message) {
        setValidationErrors([error.response.data.message]);
      } else {
        setValidationErrors(["An error occurred during registration. Please try again."]);
      }
    }
  };
  
  return (
    <div className="container">
      <div className={`registration ${isRegistrationSuccess ? "hidden" : ""}`}>
        <div className="registration__header">Registration</div>
        <Input value={email} setValue={setEmail} type="email" placeholder="Input email" />
        <Input value={login} setValue={setLogin} type="login" placeholder="Input login" />
        <Input value={name} setValue={setName} type="name" placeholder="Input name" />
        <Input value={surename} setValue={setSureName} type="surename" placeholder="Input surename" />
        <Input value={password} setValue={setPassword} type="password" placeholder="Input password" />
        <button className="registration__button" onClick={handleRegistration}>
          Sign Up
        </button>
        
        {/* Отображение ошибок над кнопкой */}
        {validationErrors.length > 0 && (
          <div className="registration__error">
            {validationErrors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
      {isRegistrationSuccess && (
        <p className="registration__message">
           Account created. Check your mail to verificate account. This window will close in 5 seconds!
        </p>
      )}
    </div>
  );
}
export default Registration;
