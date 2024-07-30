'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChangeItemModal from '@components/changeItemModal/ChangeItemModal';
import InfoModal from '@components/infoModal/InfoModal';
import ImageGallery from '@components/imageGallery/ImageGallery';
import { PiPencilSimpleThin } from "react-icons/pi";
import { PiPlusThin } from "react-icons/pi";



export default function VotingHome() {
    const [isChangeModalOpen, setChangeModalOpen] = useState(false);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const router = useRouter();

    const handleOpenChangeModal = () => {
        setChangeModalOpen(true);
    };

    const handleCloseChangeModal = () => {
        setChangeModalOpen(false);
    };

    const handleOpenInfoModal = () => {
        setInfoModalOpen(true);
    };

    const handleCloseInfoModal = () => {
        setInfoModalOpen(false);
    };

    const handleAddNewClick = () => {
        router.push('/voting/new-item');
    };

    return (
        <main className="voting">
            <div className="voting__header">
                <h1>Ra(n)ting Now</h1>
                <span>Be the change: Rate media based on feminist principles. Your opinion matters!</span>
            </div>

            <ImageGallery />

            <div className="voting__buttons">
                <div className="voting__changebuttons">
                    <button className="btn btn-textlink add-new" onClick={handleAddNewClick}>
                        <PiPlusThin />
                        <span>add new</span>
                    </button>
                    <button className="btn btn-textlink edit-item" onClick={handleOpenChangeModal}>
                        <PiPencilSimpleThin />
                        <span>edit item</span>
                    </button>
                </div>
                <button className="btn btn-textlink show-install" onClick={handleOpenInfoModal}>show installation</button>
            </div>

            <ChangeItemModal isOpen={isChangeModalOpen} onClose={handleCloseChangeModal} />
            <InfoModal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} />
        </main>
    );
}
