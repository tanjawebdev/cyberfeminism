'use client';

import { useState } from 'react';
import Modal from '@components/modal/Modal';
import styles from '@components/modal/Modal.scss';

const ChangeItemModal = ({ isOpen, onClose }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const value = parseInt(inputValue, 10);
        if (isNaN(value) || value < 1 || value > 999) {
            setError('Please enter a valid number between 1 and 999.');
        } else {
            setError('');
            console.log('Submitted ID:', value);
            // Handle the submission (e.g., send to API or update state)
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2>Change Existing Item</h2>
            <p>What is the ID of your Element?</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    min="1"
                    max="999"
                    required
                />
                <button type="submit">Submit</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </Modal>
    );
};

export default ChangeItemModal;
