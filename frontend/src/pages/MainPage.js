import React, { useState, useEffect } from 'react';
import "./MainPage.modules.scss";
import avatar from "./../assets/avatar.png";
import menuItems from "./../utils/menu-items/menuItems";
import WalletGrid from "../components/Wallets/WalletsDash"
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';

const BASE_URL = "http://localhost:5000/api/v1/";
const token = localStorage.getItem('token');

function Main({ setActive, displayDataContent, active }) {
  const isAuth = useSelector(state => state.user.isAuth);
  const currentUser = useSelector(state => state.user.currentUser);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const dispatch = useDispatch()
  const activeWallet = useSelector(state => state.user.activeWallet);

  const handleWalletSelect = async (wallet) => {
    await setActiveWallet(wallet.walletId);
    setSelectedWallet(wallet.walletId);
  }

  const setActiveWallet = async (walletId) => {
    try {
      const response = await axios.post(`${BASE_URL}set-active-wallet`, { walletId }, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Active wallet set successfully:', response.data);
      dispatch({ type: 'SET_ACTIVE_WALLET', payload: true });
    } catch (error) {
      console.error('Error setting active wallet:', error.message);
    }
  };

  const UnsetActiveWallet = async () => {
    try {
      const response = await axios.post(`${BASE_URL}unset-active-wallet`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Active wallet unset successfully');
      dispatch({ type: 'SET_ACTIVE_WALLET', payload: false });
      setSelectedWallet(null);

      const walletsResponse = await axios.get(`${BASE_URL}get-user-wallets`, { headers: { Authorization: `Bearer ${token}` } });
      setWallets(walletsResponse.data.wallets);
    } catch (error) {
      console.error('Error unsetting active wallet:', error.message);
    }
  }

  return (
    <div className='section'>
      {!isAuth || activeWallet ? (
        <div className='container'>
          <div className='section'>
            <div className="user-con">
              {currentUser.avatar != null ? (
                <img src={currentUser.avatar} alt="" /> 
              ) : (
                <img src={avatar} alt="" />
              )}
              <div className="text">
                <h2>{isAuth?(currentUser.name):'Name'}</h2>
              </div>
            </div>
            <ul className="menu-items">
              {menuItems.map((item) => {
                return <li
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={active === item.id ? 'active' : ''}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </li>
              })}
            </ul>
            {isAuth && (
              <div>
                <button onClick={UnsetActiveWallet}>Change wallet</button>
              </div>
            )}
          </div>
          <div className='content'>{displayDataContent}</div>
        </div>
      ) : (
        <WalletGrid wallets={wallets} onSelectWallet={handleWalletSelect} />
      )}
    </div>
  );
}

export default Main;
