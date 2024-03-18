import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Verification = () => {
  const { token } = useParams();
  const [verificationMessage, setVerificationMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/verify/${token}`);
        console.log('Verification response:', response.data);
        if (response.data && response.data.message === 'User verified successfully.') {
          setVerificationMessage(`Account verified succesfully. Redirection to loggin page!`);
          setTimeout(() => {
            navigate("/login");
          }, 5000);}
      } catch (error) {
        console.error('Verification error:', error);

        setVerificationMessage(`Verification failed. ${error.response.data.message}`);
        if (error.response.data.message === 'Token not found or expired' || 'Verification done') {
          navigate('/login')
        }
      }
    };

    verifyAccount();
  }, [token, navigate]);

  return (
    <div>
      <p>{verificationMessage}</p>
    </div>
  );
};

export default Verification;
