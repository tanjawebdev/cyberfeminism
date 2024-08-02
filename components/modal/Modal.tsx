import React, { ReactNode } from 'react';
import './Modal.scss';
import { TfiClose } from "react-icons/tfi";


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modalOverlay">
            <div className="modal">
                <button className="closeButton" onClick={onClose}>
                    <TfiClose />
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
