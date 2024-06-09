'use client';

import React from 'react';
import EditItemFormWrapper from '@components/editItemFormWrapper/EditItemFormWrapper';

const VotingEditItem: React.FC = () => {
    return (
        <main className="voting">
            <h1>Edit Item</h1>
            <EditItemFormWrapper />
        </main>
    );
};

export default VotingEditItem;