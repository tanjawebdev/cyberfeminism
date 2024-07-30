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
    sortDate: Date;
}

interface CategoryData {
    id: string;
    categoryName: string;
}

const ImageGallery: React.FC = () => {
    const [latestItems, setLatestItems] = useState<UploadedItem[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const router = useRouter();

    const fetchLatestItems = async (category: string | null = null) => {
        const itemsRef = collection(db, 'items');
        let q;
        if (category) {
            q = query(itemsRef, where('category', '==', category), orderBy('sortDate', 'desc'), limit(5));
        } else {
            q = query(itemsRef, orderBy('sortDate', 'desc'), limit(5));
        }
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => {
            const data = doc.data() as UploadedItem;
            return { ...data, createdAt: data.createdAt.toDate() };
        });
        setLatestItems(items);
    };

    const fetchCategories = async () => {
        const categoriesRef = collection(db, 'categories');
        const categorySnapshot = await getDocs(categoriesRef);
        const categoriesData = categorySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as CategoryData[];
        setCategories(categoriesData);
    };

    useEffect(() => {
        fetchLatestItems();
        fetchCategories();
    }, []);

    const handleImageClick = (id: number) => {
        router.push(`/voting/edit-item?id=${id}`);
    };

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
        fetchLatestItems(category);
    };

    return (
        <div className="image-gallery">
            <div className="container">
                   <span className="image-gallery__rating">⌀ Rating:</span>
                <div className="grid">
                    {latestItems.map((item) => (
                        <div key={item.id} className="g-col" onClick={() => handleImageClick(item.id)}>
                            <div className="image-gallery__image">
                                <img src={item.fileUrl} alt={`Item ${item.id}`} className="image-gallery__gallery-image" />
                            </div>
                            {item.rating}% sexist
                        </div>
                    ))}
                </div>
            </div>
            <div className="categories">
                <button className="btn btn-primary" onClick={() => handleCategoryClick(null)}>Latest</button>
                {categories.map((category) => (
                    <button key={category.id} className="btn btn-secondary" onClick={() => handleCategoryClick(category.id)}>
                        {category.categoryName}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
