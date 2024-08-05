'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type WindowSize = {
    width: number | undefined;
    height: number | undefined;
};

const useWindowSize = (): WindowSize => {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            };

            window.addEventListener('resize', handleResize);
            handleResize();

            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    return windowSize;
};

const RedirectBasedOnWidth = () => {
    const size = useWindowSize();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined' && size.width !== undefined) {
            const currentPath = window.location.pathname;
            if (size.width > 992 && currentPath !== '/') {
                router.push('/');
            } else if (size.width <= 992 && currentPath === '/') {
                router.push('/voting');
            }
        }
    }, [size, router]);

    return null;
};

export default RedirectBasedOnWidth;
