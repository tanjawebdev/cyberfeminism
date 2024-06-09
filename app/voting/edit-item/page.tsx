'use client';

import React from 'react';
import Link from 'next/link';
import EditItemFormWrapper from '@components/editItemFormWrapper/EditItemFormWrapper';

const VotingEditItem: React.FC = () => {
    return (
        <main className="voting">
            <div className="voting__header">
                <Link href="/voting" className="back-link">
                    Back
                </Link>
            </div>
            <h1>Edit Item</h1>
            <EditItemFormWrapper />
        </main>
    );
};

export default VotingEditItem;