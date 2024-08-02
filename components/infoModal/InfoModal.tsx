'use client';

import { useState } from 'react';
import Modal from '@components/modal/Modal';
import '@components/modal/Modal.scss';

interface ChangeItemModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InfoModal: React.FC<ChangeItemModalProps> = ({ isOpen, onClose }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2>Show installation</h2>
            <p>To see the installation you have to open this website: <span className="link-underline">bias-barometer.com</span> on a big screen (monitor).</p>
        </Modal>
    );
};

export default InfoModal;
