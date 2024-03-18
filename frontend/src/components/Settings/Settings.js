import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import './Settings.modules.scss';
import { setUser } from '../../reducers/userReducer';
import default_avatar from '../../assets/avatar.png'

function Settings() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [name, setName] = useState(currentUser.name || '');
  const [surename, setSurename] = useState(currentUser.surename || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  const token = localStorage.getItem('token');
  const [fieldsChanged, setFieldsChanged] = useState(false);
  const dispatch = useDispatch();
  const [avatar, setAvatar] = useState(currentUser.avatar || '')
  const [isImageEditing, setIsImageEditing] = useState(false);
  const isAuth = useSelector(state => state.user.isAuth);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  }

  useEffect(() => {
    setName(currentUser.name || '');
    setSurename(currentUser.surename || '');
    setEmail(currentUser.email || '');
    setAvatar(currentUser.avatar || '')
    setIsImageEditing(false);
  }, [currentUser]);

  const handleSave = async () => {
    try {
      const responseName = await axios.post('http://localhost:5000/api/v1/edit-profile', {
        field: 'name',
        value: name,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const responseSurename = await axios.post('http://localhost:5000/api/v1/edit-profile', {
        field: 'surename',
        value: surename,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const responseEmail = await axios.post('http://localhost:5000/api/v1/edit-profile', {
        field: 'email',
        value: email,
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (newPassword) {
        const responsePassword = await axios.post('http://localhost:5000/api/v1/edit-profile', {
          field: 'password',
          value: newPassword,
          oldPassword: oldPassword,
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      let newAvatarUrl = currentUser.avatar;

      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);

        const responseAvatar = await axios.post('http://localhost:5000/api/v1/edit-profile', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (responseAvatar && responseAvatar.data.imageUrl) {
          newAvatarUrl = responseAvatar.data.imageUrl;
        }
      }

      setTimeout(() => {
        setUpdateMessage('Profile successfully updated');
        const updatedUser = {
          name,
          surename,
          email,
          avatar: newAvatarUrl,
        };

        dispatch(setUser(updatedUser, () => {
          setUpdateError('');
          resetFields();
          setEditMode(false);
          setFieldsChanged(false);
        }));

      }, 1000);
    } catch (error) {
      console.error(error.response);
      setUpdateMessage('');
      setUpdateError(error.response?.data.message || 'Error updating profile');
    }
  };

  const resetFields = () => {
    setName(currentUser.name || '');
    setSurename(currentUser.surename || '');
    setEmail(currentUser.email || '');
    setAvatar(currentUser.avatar || '')
    setNewPassword('');
    setOldPassword('');
    setIsImageEditing(false);
  };

  const handleImageClick = () => {
    if (editMode) {
      setIsImageEditing(true);
    }
  };

  const handleCancel = () => {
    if (fieldsChanged) {
      resetFields();
      setFieldsChanged(false);
    }
    setEditMode(false);
    setUpdateMessage('');
    setUpdateError('');
    setName(currentUser.name || '');
    setSurename(currentUser.surename || '');
    setEmail(currentUser.email || '');
    setAvatar(currentUser.avatar || '')
  };

  return (
    <div className="settings-container">
        <h1>Settings</h1>
      <div className="main-content">
        <div className="left-container">
          <div className="user-con">
            <div className="text">
              <h2>{isAuth ? currentUser.name : 'Your Name'}</h2>
            </div>
            {editMode ? (
              <>
                <label htmlFor="avatarInput">
                  <img src={currentUser.avatar} alt="" />
                  <div className="edit-overlay">
                    <span>Change</span>
                  </div>
                </label>
                <input
                  id="avatarInput"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </>
            ) : (
              <img src={isAuth ? currentUser.avatar : default_avatar} alt="" />
            )}
          </div>
        </div>
        <div className='right-container'>
          <div className='main-section'>
            <input
              type='text'
              placeholder='Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editMode}
            />
            <input
              type='text'
              placeholder='Surename'
              value={surename}
              onChange={(e) => setSurename(e.target.value)}
              disabled={!editMode}
            />
            <input
              type='text'
              placeholder='E-mail'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editMode}
            />
            <div className='password-input'>
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder='New password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!editMode}
              />
              <span
                disabled={!editMode}
                className={`password-toggle ${passwordVisible ? 'visible' : ''}`}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                👁️
              </span>
            </div>
            <div className='password-input'>
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder='Old password'
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={!editMode}
              />
              <span
                disabled={!editMode}
                className={`password-toggle ${passwordVisible ? 'visible' : ''}`}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                👁️
              </span>
            </div>
          </div>
          {isAuth&& <div className='section-bottom'>
            {editMode ? (
              <div className='button'>
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel}>Discard</button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)}>Edit</button>
            )}
            <div className='update-message'>
              {updateMessage && <p className='success-message'>{updateMessage}</p>}
              {updateError && <p className='error-message'>{updateError}</p>}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}



export default Settings;