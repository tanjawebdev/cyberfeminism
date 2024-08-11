'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Importiere deine Firebase-Datenbankinstanz
import Modal from '@components/modal/Modal';
import '@components/modal/Modal.scss';
import './ChangeItemModal.scss';

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = parseInt(inputValue, 10);
        if (isNaN(value) || value < 1 || value > 999) {
            setError('Please enter a valid number between 1 and 999.');
        } else {
            setError('');
            // Überprüfen, ob die benutzerdefinierte ID in Firebase existiert
            const itemsRef = collection(db, 'realitems');
            const q = query(itemsRef, where('id', '==', value));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Wenn das Dokument mit der benutzerdefinierten ID existiert, weiterleiten
                console.log('Submitted ID:', value);
                onClose();
                router.push(`/voting/edit-item?id=${value}`);
            } else {
                // Wenn das Dokument nicht existiert, Fehlermeldung anzeigen und Eingabe zurücksetzen
                setError('ID nicht vorhanden');
                setInputValue('');
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2>Change Existing Item</h2>
            <p>What is the ID of your Element?</p>
            <form onSubmit={handleSubmit} className="changeItemModal">
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
