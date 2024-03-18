import React, { useState, useEffect, useRef } from 'react';
import {useSelector} from 'react-redux'
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode.react';
import './Card.modules.scss';
import Barcode from 'react-barcode';

const BASE_URL = "http://localhost:5000/api/v1/";
const token = localStorage.getItem('token');

const CodeDisplayPopup = ({ codeType, code, closePopup, handleChangeCodeType }) => {
  return (
    <div className='popup-code'>
      <button className='popup-code-button' onClick={closePopup}>×</button>
      {codeType === 'qr' ? (
        <QRCode value={code} size={300} />
      ) : (
        <Barcode value={code} width={2} height={100} />
      )}
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button onClick={handleChangeCodeType} style={{ padding: '10px', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
          Toggle Code Type
        </button>
      </div>
    </div>
  );
};

function Card({ active, setActive, displayDataContent }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [qrMessage, setQrMessage] = useState('');
  const [isPostRequested, setIsPostRequested] = useState(false);
  const [cards, setCards] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [generateQr, setGenerateQr] = useState(true);
  const [cardDisplayMode, setCardDisplayMode] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [codeToDisplay, setCodeToDisplay] = useState('');
  const [codeTypeToDisplay, setCodeTypeToDisplay] = useState('qr');
  const isAuth = useSelector(state => state.user.isAuth);

  useEffect(() => {
    const config = { fps: 10, qrbox: { width: 400, height: 400 } };
    const html5QrCode = new Html5Qrcode('qrCodeContainer');
  
    const qrScanerStop = () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => console.log('Scanner stopped'))
          .catch((err) => console.log('Scanner error', err));
      }
    };
  
    const qrCodeSuccess = (decodedText) => {
      setQrMessage(decodedText);
      setScanning(false);
      setCode(decodedText);
      const scanerElement = document.querySelector('.scaner');
      scanerElement.style.display = 'none'
    };
  
    if (scanning) {
      html5QrCode.start({ facingMode: 'environment' }, config, qrCodeSuccess);
      setQrMessage('');
    } else {
      qrScanerStop(); 
    }
  
    return () => {
      qrScanerStop();
    };
  }, [scanning]);

  const fetchCards = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const cardsWithDisplayMode = response.data.cards.map((card) => ({
          ...card,
          displayMode: cardDisplayMode[card._id] || 'qr',
        }));
        setCards(cardsWithDisplayMode);
      } else {
        console.error('Error getting cards:', response.statusText);
      }
    } catch (error) {
      console.error('Error getting cards:', error);
    }
  };

  useEffect(() => {
    if (isPostRequested) {
      axios.post(`${BASE_URL}add-card`, { name, code, generateQr }, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          console.log('Card added successfully:', response.data);
          setName('');
          setCode('');
          fetchCards();
          setIsPostRequested(false);
        })
        .catch((error) => {
          console.error('Error adding card:', error);
          setIsPostRequested(false);
        });
    }
  }, [isPostRequested, name, generateQr]);

  useEffect(() => {
    fetchCards();
  }, []);

  const handleStartStopClick = (e) => {
    e.preventDefault();
    setScanning(!scanning);
    const scanerElement = document.querySelector('.scaner');
    scanerElement.style.display = scanning ? 'none' : 'flex';
  };

  const handleDeleteClick = (id) => {
    setCardToDelete(id);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = (id) => {
    axios.delete(`${BASE_URL}delete-card/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        console.log('Card deleted successfully:', response.data);
        fetchCards();
        setShowConfirmation(false);
      })
      .catch((error) => {
        console.error('Error deleting card:', error);
        setShowConfirmation(false);
      });
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleOpen = () => {
    setShowPopup(true);
  };

  const openCodePopup = (code, codeType) => {
    setCodeToDisplay(code);
    setCodeTypeToDisplay(codeType);
    setShowCodePopup(true);
  };

  const handleChangeCodeType = () => {
    setCodeTypeToDisplay(codeTypeToDisplay === 'qr' ? 'bar' : 'qr');
  };

  const Popup = ({ closePopup }) => {
    const nameInputRef = useRef(null);
    const codeInputRef = useRef(null);
    const [isFirstRender, setIsFirstRender] = useState(true);
  
    useEffect(() => {
      if (isFirstRender && nameInputRef.current) {
        nameInputRef.current.focus();
        setIsFirstRender(false);
      }
    }, [isFirstRender]);
  
    const handleFormSubmit = (e) => {
      e.preventDefault();
      setIsPostRequested(true);
    };
  
    const resetForm = () => {
      setName('');
      setCode('');
      closePopup();
    };
  
    const handleClosePopup = () => {
      resetForm();
      closePopup();
    };
  
    return (
      <div className='popup-card'>
        <button className='popup-close-button' onClick={handleClosePopup}>×</button>
        <form onSubmit={handleFormSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={nameInputRef}
            />
          </label>
          <label>
            Code:
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              ref={codeInputRef}
              readOnly
            />
          </label>
          <div className="scan-status">
            {scanning ? 'Scanning in progress...' : ''}
          </div>
          <button className="start-stop" onClick={handleStartStopClick}>
            {scanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
          {isAuth && <button type="submit">Add Card</button>}
        </form>
      </div>
    );
  };

  return (
    <div className="card-page">
      <div className="scaner">
        <div id="qrCodeContainer" />
      </div>

      <div className="cards">
      <h2 className="card-title">Card List</h2>
        <div className="card-container">
          <div className='card'>
            <div className='add-card' >
              <button onClick={() => handleOpen(true)}>+</button>
            </div>
            {showPopup && <Popup closePopup={handleClose} />}
          </div>
          {cards.map((card) => (
            <div key={card._id} className="card">
              <div className="card-info">
                <div className="name">{card.name}</div>
                <button onClick={() => openCodePopup(card.code, 'qr')}>Show Code</button>
                <button onClick={() => handleDeleteClick(card._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showConfirmation && (
          <div className="modal-content">
            <p>Are you sure you want to delete this card?</p>
            <button onClick={() => handleConfirmDelete(cardToDelete)}>Yes</button>
            <button onClick={handleCancelDelete}>No</button>
          </div>
      )}

      {showCodePopup && (
        <CodeDisplayPopup
          codeType={codeTypeToDisplay}
          code={codeToDisplay}
          closePopup={() => setShowCodePopup(false)}
          handleChangeCodeType={handleChangeCodeType}
        />
      )}
    </div>
  );
}

export default Card;
