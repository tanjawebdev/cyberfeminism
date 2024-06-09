'use client';

import { useState } from 'react';
import Modal from '@components/modal/Modal';
import '@components/modal/Modal.scss';

interface ChangeItemModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HomeModal: React.FC<ChangeItemModalProps> = ({ isOpen, onClose }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <p>To contribute to the installation, you have to open the website on a mobile device, or scan the QR code to the right</p>
        </Modal>
    );
};

export default HomeModal;
