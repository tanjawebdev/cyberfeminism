'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@components/modal/Modal';
import '@components/modal/Modal.scss';

interface ChangeItemModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangeItemModal: React.FC<ChangeItemModalProps> = ({ isOpen, onClose }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = parseInt(inputValue, 10);
        if (isNaN(value) || value < 1 || value > 999) {
            setError('Please enter a valid number between 1 and 999.');
        } else {
            setError('');
            console.log('Submitted ID:', value);
            onClose();
            router.push(`/voting/edit-item?id=${value}`);
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
                <button className="btn btn-primary" type="submit">Submit</button>
            </form>
            {error && <p className="error">{error}</p>}
        </Modal>
    );
};

export default ChangeItemModal;
