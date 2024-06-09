'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import "@styles/home.scss";

interface UploadedItem {
    fileUrl: string;
    category: string;
    rating: number;
    id: number;
    createdAt: Date;
    allRatings: number[];
}

export default function Home() {
    const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const fetchItems = (category: string | null) => {
        const itemsRef = collection(db, 'items');
        let q;
        if (category) {
            q = query(itemsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
        } else {
            q = query(itemsRef, orderBy('createdAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    createdAt: data.createdAt.toDate(),
                } as UploadedItem;
            });
            setUploadedItems(items);
        });

        return () => unsubscribe();
    };

    useEffect(() => {
        const unsubscribe = fetchItems(selectedCategory);
        return () => unsubscribe();
    }, [selectedCategory]);

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
    };

    return (
        <main className="home">
            <div>Startscreen</div>
            <div className="container">
                <div className="home__uploadedItems grid">
                    {uploadedItems.map((item, index) => (
                        <div key={index} className="uploadedItem">
                            <Image
                                src={item.fileUrl}
                                alt={`Uploaded Item ${index + 1}`}
                                width={200}
                                height={200}
                            />
                            <p>Category: {item.category}</p>
                            <p>Rating: {item.rating}</p>
                            <p>Number of Ratings: {item.allRatings.length}</p>
                            <p>ID: {item.id}</p>
                            <p>Created: {item.createdAt.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className="home__buttons grid">
                    <div className="btn btn-secondary g-col" onClick={() => handleCategoryClick(null)}>All</div>
                    <div className="btn btn-secondary g-col" onClick={() => handleCategoryClick('option1')}>Movies</div>
                    <div className="btn btn-secondary g-col" onClick={() => handleCategoryClick('option2')}>Memes</div>
                    <div className="btn btn-secondary g-col" onClick={() => handleCategoryClick('option3')}>Books</div>
                </div>
            </div>
        </main>
    );
}
