'use client';

import React, { useEffect, useState, useRef } from 'react';
import RedirectBasedOnWidth from '@components/redirectBasedOnWidth/RedirectBasedOnWidth';
import Image from "next/image";
import { collection, query, where, orderBy, onSnapshot, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import "@styles/home.scss";
import HomeModal from "@components/homeModal/HomeModal";
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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
    individualQuestion: string;
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
        // Instantly scroll to the top of the page when the component mounts
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

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

    // GSAP animation
    useEffect(() => {
        // Clear any existing animations and scroll triggers
        gsap.killTweensOf(itemsRef.current);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        // Start the headline animation immediately
        gsap.fromTo(".cat-headline",
            {
                opacity: 0,
                scale: 0.8,
                filter: 'blur(10px)'
            },
            {
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                duration: 1,
                ease: 'power2.out'
            }
        );

        // GSAP animation with ScrollTrigger for the rest of the elements
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
                        duration: 1.5,
                        opacity: 1,
                        filter: 'blur(0px)',
                        top: topPosition,
                        left: leftPosition,
                        scale: 1,
                        ease: 'power2.out'
                    }, '-=1');
                }
                if (index === 4) {
                    tl.to(".cat-headline", {
                        opacity: 0,
                        scale: 0.8,
                        filter: 'blur(10px)',
                        duration: 1,
                        ease: 'power2.in'
                    }, `-=${1.5}`);
                }

                // Start fading out older elements after the 10th element
                if (index >= 8) {
                    const elementToFadeOut = itemsRef.current[index - 8];
                    tl.to(elementToFadeOut, {
                        opacity: 0,
                        duration: 1,
                        ease: 'power2.out'
                    }, `-=${1.5}`);
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
        // Instantly scroll to the top of the page
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        // Clear all existing animations and triggers
        gsap.killTweensOf(itemsRef.current);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        // Update the category
        itemsRef.current = [];
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
                <span className="top">{categoryData?.individualSliderMaxTitle || ''}</span>
                <span className="bottom">{categoryData?.individualSliderMinTitle || ''}</span>
            </div>
            <div className="home__container">
                <div className="home__uploadedItems">
                    <h1 className="cat-headline">
                        {categoryData?.individualQuestion || 'Ra(n)ting: How Sexist Is The Media?'}
                    </h1>

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
                     onClick={() => handleCategoryClick(null)}>Latest</div>

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
