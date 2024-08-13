'use client';

import React, { useEffect, useState, useRef } from 'react';
import RedirectBasedOnWidth from '@components/redirectBasedOnWidth/RedirectBasedOnWidth';
import Image from "next/image";
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import "@styles/home.scss";
import HomeModal from "@components/homeModal/HomeModal";
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

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
    const itemsRef = useRef<HTMLDivElement[]>([]);

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

    useEffect(() => {
        // Clear any existing animations and scroll triggers
        gsap.killTweensOf(itemsRef.current);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        // GSAP animation with ScrollTrigger
        if (itemsRef.current.length > 0) {
            const tl = gsap.timeline();

            itemsRef.current.forEach((elem, index) => {
                const item = uploadedItems[index];
                if (item) {
                    const topPosition = item.individualRating
                        ? `calc(100% - ${item.individualRating}%)`
                        : `${Math.floor(Math.random() * 100) + 1}%`;

                    const leftPosition = item.rating
                        ? `${item.rating}%`
                        : `${Math.floor(Math.random() * 100) + 1}%`;

                    tl.to(elem, {
                        duration: 2,
                        opacity: 1,
                        top: topPosition,
                        left: leftPosition,
                        scale: 1,
                        ease: 'power2.out'
                    }, '-=0.3');
                }
            });

            ScrollTrigger.create({
                animation: tl,
                trigger: ".path-bg",
                start: "top top",
                scrub: 2,
                anticipatePin: 1
            });

            // Force ScrollTrigger to recalculate positions
            ScrollTrigger.refresh();
        }
    }, [uploadedItems]);

    const handleCategoryClick = (category: string | null) => {
        itemsRef.current = [];
        gsap.killTweensOf(itemsRef.current);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
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
            <RedirectBasedOnWidth />
            <div className="home__logo">
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
                        <div
                            key={index}
                            className="uploadedItem"
                            ref={(el) => {
                                if (el) {
                                    itemsRef.current[index] = el;
                                }
                            }}>
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
            <div className="path-bg"></div>
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
