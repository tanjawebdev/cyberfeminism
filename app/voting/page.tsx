'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChangeItemModal from '@components/changeItemModal/ChangeItemModal';
import InfoModal from '@components/infoModal/InfoModal';
import ImageGallery from '@components/imageGallery/ImageGallery';

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
            <h1>Rate me</h1>

            <ImageGallery />

            <div className="buttons">
                <button className="btn btn-secondary add-new" onClick={handleAddNewClick}>Add New</button>
                <button className="btn btn-primary" onClick={handleOpenChangeModal}>Change existing</button>
                <button className="btn btn-primary" onClick={handleOpenInfoModal}>Show installation</button>
            </div>

            <ChangeItemModal isOpen={isChangeModalOpen} onClose={handleCloseChangeModal} />
            <InfoModal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} />
        </main>
    );
}
