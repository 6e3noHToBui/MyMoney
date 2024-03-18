import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './Wallet.modules.scss';

const BASE_URL = "http://localhost:5000/api/v1/";
const token = localStorage.getItem('token');

function WalletGrid({ onSelectWallet }) {
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [walletName, setNewWalletName] = useState('');
  const [walletAmount, setNewWalletAmount] = useState('');
  const [wallets, setWallets] = useState([]);
  const isAuth = useSelector(state => state.user.isAuth)

  const fetchUserWallets = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-user-wallets`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Wallets from server:', response.data);
      setWallets(response.data.userWallets);
    } catch (error) {
      console.error('Error fetching user wallets:', error.message);
    }
  };

  useEffect(() => {
    fetchUserWallets();
  }, []);

  const createWallet = async () => {
    try {
      const response = await axios.post(`${BASE_URL}create-wallet`, { name: walletName, amount: walletAmount }, { headers: { Authorization: `Bearer ${token}` } });

      console.log('Wallet created successfully:', response.data);

      fetchUserWallets();
      setNewWalletName('');
      setNewWalletAmount('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      console.error('Error creating wallet:', errorMessage);
    }
  };

  const toggleCreatingWallet = () => {
    setCreatingWallet(prevState => !prevState);
  };

  return (
    <div className="wallet-grid">
      {/* Button for creating a new wallet */}
      <div
        className={`wallet-item create-wallet ${creatingWallet ? 'creating-wallet' : ''}`}
        onClick={toggleCreatingWallet}
      >
        <div className="wallet-border">
          <span className="wallet-title"> Create Wallet </span>
          {/* Form for creating a new wallet */}
          {(
            <div className="create-wallet-form">
              <input
                type="text"
                placeholder="Wallet Name"
                value={walletName}
                onChange={(e) => setNewWalletName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Amount"
                value={walletAmount}
                onChange={(e) => setNewWalletAmount(e.target.value)}
              />
              <button onClick={isAuth ? createWallet : ''}>Create</button>
            </div>
          )}
        </div>
      </div>

      {/* Wallets displayed in a grid */}
      {wallets.map((wallet, index) => (
        <div
          key={index}
          className="wallet-item"
          onClick={() => onSelectWallet({ walletId: wallet.id, ...wallet })}
        >
          <div className="wallet-border">
            <div className="wallet-icon">{/* Add icon logic if needed */}</div>
            <div className="wallet-name">{wallet && wallet.name}</div>
            <div className="wallet-amount">{wallet && wallet.amount}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WalletGrid;
