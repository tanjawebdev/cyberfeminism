'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './HeaderMobile.scss';
import { BsArrowLeft } from "react-icons/bs";


const HeaderMobile = () => {
    const router = useRouter();
    const pathname = usePathname();

    const showBackButton = pathname.includes('/edit-item') || pathname.includes('/new-item');

    return (
        <header className="header">
            {showBackButton && (
                <button className="back-button" onClick={() => router.back()}>
                <BsArrowLeft />
                <span>back</span>
                </button>
            )}
            <div className="logo">
                <img src="/icons/logo.svg" alt="Logo" />
            </div>
        </header>
    );
};

export default HeaderMobile;