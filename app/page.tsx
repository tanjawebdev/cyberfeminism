'use client';

import gsap from 'gsap';
import React, { useEffect, useState, useRef } from 'react';
import RedirectBasedOnWidth from '@components/redirectBasedOnWidth/RedirectBasedOnWidth';
import Image from "next/image";
import {collection, query, where, orderBy, onSnapshot, getDocs, doc, limit} from 'firebase/firestore';
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
    individualSliderHeadline: string;
    individualSliderMinTitle: string;
    individualSliderMaxTitle: string;
    individualSliderMaxTitleShort: string;
}

export default function Home() {
    const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isHomeModalOpen, setHomeModalOpen] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData | null>(null);

    const fetchItems = (category: string | null) => {
        const itemsRef = collection(db, 'realitems');
        let q;
        if (category) {
            q = query(itemsRef, where('category', '==', category), orderBy('sortDate', 'desc'), limit(15));
        } else {
            q = query(itemsRef, orderBy('sortDate', 'desc'), limit(15));
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
                ...doc.data(),
            })) as CategoryData[];
            setCategories(categories);
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
        if (category) {
            const selectedCategoryData = categories.find(cat => cat.id === category);
            setCategoryData(selectedCategoryData || null);
        } else {
            setCategoryData(null);
        }
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

    const getCategoryMaxTitle = (categoryId: string): string => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.individualSliderMaxTitle : 'Unknown';
    };

    return (
        <main className="home">
            <RedirectBasedOnWidth/>
            <div className="logo">
                <Image
                    src="/icons/logo.svg"
                    alt="Logo"
                    width={160}
                    height={70}
                />
            </div>
            <div className="home__home-modal">
                <div className="btn btn-textlink" onClick={handleOpenHomeModal}>
                    <span className="text">how to edit or add items</span>
                    <span className="big-symbol">?</span>
                </div>
            </div>
            <div className="home__coordinate-system">
                <span className="left">feminist</span>
                <span className="right">sexist</span>
                <span className="top">top</span>
                <span className="bottom">bottom</span>
            </div>
            <div className="home__container">
                <div className="home__uploadedItems">
                    {uploadedItems.map((item, index) => (
                        <div key={index} className="uploadedItem">
                             <img src={item.fileUrl} alt="Logo" className="item-image"/>

                            <div className="item-info">
                                <div className="item-details first-line">
                                    <p>⌀ Rating ({item.allRatings.length}):</p>
                                    <p>ID: {item.id}</p>
                                </div>
                                <div className="item-details second-line">
                                    <p>{item.rating}% sexist</p>
                                    {categoryData && (
                                        <p>
                                            , {item.individualRating}% {categoryData?.individualSliderMaxTitleShort}
                                        </p>
                                    )}
                                </div>
                                <div className="item-details date-line">
                                    <p>{item.sortDate?.toLocaleDateString('de-DE')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <div className="home__buttons">
                <div className={`btn btn-secondary ${selectedCategory === null ? 'active' : ''}`}
                     onClick={() => handleCategoryClick(null)}>All</div>

                {categories.map((category) => (
                    <div key={category.id} className={`btn btn-secondary ${selectedCategory === category.id ? 'active' : ''}`}
                         onClick={() => handleCategoryClick(category.id)}>
                        {category.categoryName}
                    </div>
                ))}
            </div>

            <HomeModal isOpen={isHomeModalOpen} onClose={handleCloseHomeModal}/>
        </main>
    );
}
