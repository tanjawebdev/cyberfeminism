'use client';

import React from 'react';
import Link from 'next/link';
import EditItemFormWrapper from '@components/editItemFormWrapper/EditItemFormWrapper';

const VotingEditItem: React.FC = () => {
    return (
        <main className="voting">
            <EditItemFormWrapper />
        </main>
    );
};

export default VotingEditItem;