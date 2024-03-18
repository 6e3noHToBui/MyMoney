import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AcceptInvite = () => {
  const { token } = useParams();
  const [verificationMessage, setVerificationMessage] = useState("Accepting...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/accept-invite/${token}`);
        console.log('Accepting response:', response.data);
        navigate('/main');
      } catch (error) {
        console.error('Accepting error:', error);
        setVerificationMessage(`Accepting failed. ${error.response.data.message}`);
      }
    };

    verifyInvite();
  }, [token, navigate]);

  return (
    <div>
      <p>{verificationMessage}</p>
    </div>
  );
};

export default AcceptInvite;
