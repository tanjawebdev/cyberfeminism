'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChangeItemModal from '@components/changeItemModal/ChangeItemModal';
import ImageGallery from '@components/imageGallery/ImageGallery';

export default function VotingHome() {
    const [isModalOpen, setModalOpen] = useState(false);
    const router = useRouter();

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
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
                  <button className="btn btn-primary" onClick={handleOpenModal}>Change existing</button>
              </div>

              <ChangeItemModal isOpen={isModalOpen} onClose={handleCloseModal} />
          </main>
  );
}
