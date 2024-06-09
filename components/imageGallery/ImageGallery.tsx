'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import './ImageGallery.scss';

interface UploadedItem {
    fileUrl: string;
    category: string;
    rating: number;
    id: number;
    createdAt: any;
}

const ImageGallery: React.FC = () => {
    const [latestItems, setLatestItems] = useState<UploadedItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const router = useRouter();

    const fetchLatestItems = async (category: string | null = null) => {
        const itemsRef = collection(db, 'items');
        let q;
        if (category) {
            q = query(itemsRef, where('category', '==', category), orderBy('createdAt', 'desc'), limit(5));
        } else {
            q = query(itemsRef, orderBy('createdAt', 'desc'), limit(5));
        }
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => {
            const data = doc.data() as UploadedItem;
            return { ...data, createdAt: data.createdAt.toDate() };
        });
        setLatestItems(items);
    };

    useEffect(() => {
        fetchLatestItems();
    }, []);

    const handleImageClick = (id: number) => {
        router.push(`/voting/edit-item?id=${id}`);
    };

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
        fetchLatestItems(category);
    };

    return (
        <div className="imageGallery">
            <div className="container">
                <div className="grid">
                    {latestItems.map((item) => (
                        <div key={item.id} className="g-col" onClick={() => handleImageClick(item.id)}>
                            <div className="imageGallery__image">
                                <img src={item.fileUrl} alt={`Item ${item.id}`} className="galleryImage" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="categories">
                <div className="grid">
                    <div className="g-col" onClick={() => handleCategoryClick(null)}>All</div>
                    <div className="g-col" onClick={() => handleCategoryClick('option1')}>Movies</div>
                    <div className="g-col" onClick={() => handleCategoryClick('option2')}>Memes</div>
                    <div className="g-col" onClick={() => handleCategoryClick('option3')}>Books</div>
                </div>
            </div>
        </div>
    );
};

export default ImageGallery;
