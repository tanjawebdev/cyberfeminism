'use client';

import React, { useEffect, useState } from 'react';
import RedirectBasedOnWidth from '@components/redirectBasedOnWidth/RedirectBasedOnWidth';
import Image from "next/image";
import { collection, query, where, orderBy, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import "@styles/home.scss";
import HomeModal from "@components/homeModal/HomeModal";

interface UploadedItem {
    fileUrl: string;
    category: string;
    rating: number;
    individualRating: number;
    id: number;
    createdAt: Date;
    editedAt: Date;
    sortDate: Date;
    allRatings: number[];
}

interface CategoryData {
    id: string;
    categoryName: string;
}

export default function Home() {
    const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isHomeModalOpen, setHomeModalOpen] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryData[]>([]);

    const fetchItems = (category: string | null) => {
        const itemsRef = collection(db, 'realitems');
        let q;
        if (category) {
            q = query(itemsRef, where('category', '==', category), orderBy('sortDate', 'desc'));
        } else {
            q = query(itemsRef, orderBy('sortDate', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    sortDate: data.sortDate?.toDate(),
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

    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesRef = collection(db, 'categories');
            const categorySnapshot = await getDocs(categoriesRef);
            const categories: CategoryData[] = categorySnapshot.docs.map((doc) => ({
                id: doc.id,
                categoryName: doc.data().categoryName,
            }));
            setCategories(categories);
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
    };

    const handleOpenHomeModal = () => {
        setHomeModalOpen(true);
    };

    const handleCloseHomeModal = () => {
        setHomeModalOpen(false);
    };

    const getCategoryName = (categoryId: string): string => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.categoryName : 'Unknown';
    };

    return (
        <main className="home">
            <RedirectBasedOnWidth />
            <div>Startscreen</div>
            <div className="home__home-modal">
                <div className="btn btn-primary g-col" onClick={handleOpenHomeModal}>edit or add items</div>
            </div>
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
                            <p>Category Name: {getCategoryName(item.category)}</p>
                            <p>Rating: {item.rating}</p>
                            <p>Individual Rating: {item.individualRating}</p>
                            <p>Number of Ratings: {item.allRatings.length}</p>
                            <p>ID: {item.id}</p>
                            <p>Sort Date: {item.sortDate?.toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
                <div className="home__buttons grid">
                    <div className="btn btn-secondary g-col" onClick={() => handleCategoryClick(null)}>All</div>
                    {categories.map((category) => (
                        <div key={category.id} className="btn btn-secondary g-col"
                             onClick={() => handleCategoryClick(category.id)}>
                            {category.categoryName}
                        </div>
                    ))}
                </div>

                <HomeModal isOpen={isHomeModalOpen} onClose={handleCloseHomeModal}/>
            </div>
        </main>
    );
}
