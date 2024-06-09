'use client';

import React, { Suspense } from 'react';
import EditItemForm from '@components/editItemForm/EditItemForm';

const EditItemFormWrapper: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditItemForm />
        </Suspense>
    );
};

export default EditItemFormWrapper;
