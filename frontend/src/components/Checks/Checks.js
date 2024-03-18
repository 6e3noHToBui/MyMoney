import React, { useState, useEffect } from 'react';
import {useSelector} from 'react-redux'
import Button from '../Button/Button';
import "./Checks.modules.scss"
import { useGlobalContext } from '../../context/globalContext';
import { plus } from '../../utils/Icons';

const Popup = ({ closePopup, fetchData }) => {
    const { addCheck, error, setError } = useGlobalContext();
    const isAuth = useSelector(state => state.user.isAuth);
    const [inputState, setInputState] = useState({receipt: null,});

    const [previewImage, setPreviewImage] = useState(null);

    const handleInput = (name) => (e) => {
        const file = e.target.files[0];

        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(file);

                setInputState((prevState) => ({ ...prevState, [name]: file }));
                setError('');
            } else {
                e.target.value = null;
                setPreviewImage(null);
                setInputState((prevState) => ({ ...prevState, [name]: null }));
                setError('Please select a valid image file.');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!error) {
            addCheck(inputState);
            setInputState({
                receipt: null,
            });
            setPreviewImage(null);
            closePopup();
            setTimeout(() => {
                fetchData();
            }, 2000);
        }
    };

    return (
        <div className="popupContainer">
            <button className="popup-button" onClick={closePopup}>
                ×
            </button>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="input-control">
                    <label className="file-upload">
                        <input
                            type="file"
                            name="receipt"
                            accept="image/*"
                            onChange={handleInput('receipt')}
                        />
                        <span>Choose file</span>
                    </label>
                    {error && error.includes('image') && <p className='error'>{error}</p>}
                </div>
                {previewImage && (
                    <div className="image-preview">
                        <img src={previewImage} alt="Preview" style={{ width: '100%', maxHeight: '200px' }} />
                    </div>
                )}
                <div className="submit-btn">
                    {isAuth && <Button
                        name={'Add Receipt'}
                        icon={plus}
                        bPad={'.8rem 1.6rem'}
                        bRad={'10px'}
                        bg={'#2c3e50'}
                        color={'#fff'}
                    />}
                </div>
            </form>
        </div>
    );
}

function Paragon() {
    const { getChecks } = useGlobalContext();
    const [showPopup, setShowPopup] = useState(false);
    const [showParagon, setShowParagon] = useState(false);
    const [checks, setChecks] = useState([]);
    const [selectedCheck, setSelectedCheck] = useState(null);

    const fetchData = async () => {
        try {
            const fetchedChecks = await getChecks();
            console.log('Data for rendering:', fetchedChecks);
            setChecks(fetchedChecks);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [getChecks, setChecks]);

    const handleClose = () => {
        setShowPopup(false);
        setShowParagon(false);
    };

    const handleOpen = () => {
        setShowPopup(true);
        setShowParagon(true);
    };

    return (
        <div className='paragon-container'>
            <h2>Receipt List</h2>
            <div className='paragon-grid'>
                <div className='paragon'>
                    <div className='add-paragon'>
                        <button onClick={handleOpen}>+</button>
                    </div>
                    {showPopup && <Popup closePopup={handleClose} fetchData={fetchData} />}
                </div>
                {checks.map((checkUrl, index) => (
                    <div
                        className="paragon"
                        key={index}
                        id={`paragon${index + 1}`}
                        onClick={() => setSelectedCheck(checkUrl)}
                    >
                        <img
                            src={checkUrl}
                            alt={`paragon${index + 1}`}
                            style={{ width: '200px', height: '200px' }}
                        />
                    </div>
                ))}

                {selectedCheck && (
                    <div className="check-detail-container">
                        <img
                            src={selectedCheck}
                            alt="Selected Check"
                            style={{ width: '100%', maxHeight: '400px' }}
                        />
                        <button
                            className="close-check-detail-x"
                            onClick={() => setSelectedCheck(null)}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Paragon;