import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './UserWallet.modules.scss'

const walletApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1/',
});

walletApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UserWalletForm = () => {
  const [login, setLogin] = useState('');
  const [usersInWallet, setUsersInWallet] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});

  const getUsersInWallet = async () => {
    try {
      const response = await walletApi.get('/get-users-in-wallet');
      setUsersInWallet(response.data.users);
    } catch (error) {
      console.error('Error getting users in wallet:', error.message);
    }
  };

  const handleInviteUserToWallet = async () => {
    try {
      setRequestStatus({ status: 'pending', message: 'Sending request...' });
      await walletApi.post('/add-user-to-wallet', { login });
      setLogin('');
      setRequestStatus({ status: 'success', message: 'Request sent successfully!' });
      getUsersInWallet();
    } catch (error) {
      setRequestStatus({ status: 'error', message: `Error: ${error.message}` });
      console.error('Error adding user to wallet:', error.message);
    }
  };

  const deleteUserFromWallet = async (loginToDelete) => {
    try {
      setRequestStatus({ status: 'pending', message: 'Sending request...' });
      await walletApi.post('/delete-user-from-wallet', { login: loginToDelete });
      setRequestStatus({ status: 'success', message: 'User deleted successfully!' });
      getUsersInWallet();
    } catch (error) {
      setRequestStatus({ status: 'error', message: `Error: ${error.message}` });
      console.error('Error deleting user from wallet:', error.message);
    }
  };

  useEffect(() => {
    getUsersInWallet();
  }, []);

  return (
    <div className='wallet-form'>
      <div>
        <h2>Add user to wallet</h2>
        <label>Login:</label>
        <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} />
        <button onClick={handleInviteUserToWallet}>Add User</button>
        {requestStatus.status === 'success' && <p>{requestStatus.message}</p>}
        {requestStatus.status === 'error' && <p>{requestStatus.message}</p>}
      </div>
      <div className='users-in-wallet'>
        <h2>Users in Wallet:</h2>
        <ul>
          {usersInWallet.map((user) => (
            <li key={user.id}>
              {user.name} {user.surename}
              <button onClick={() => setUserToDelete(user.login)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      {userToDelete && (
        <div className='delete-user-from-wallet'>
          <p>Confirm deleting user?</p>
          <button onClick={() => deleteUserFromWallet(userToDelete) && setUserToDelete(null)}>Yes</button>
          <button onClick={() => setUserToDelete(null)}>No</button>
        </div>
      )}
    </div>
  );
};


export default UserWalletForm;
