'use client';

import React, {useEffect, useState, useRef, useCallback} from 'react';
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
    const [categoryAnimate, setCategoryAnimate] = useState(false);
    const [latestAnimate, setLatestAnimate] = useState(false);


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

        if (!selectedCategory) {
            setLatestAnimate(true);
        }

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
    const animateItems = useCallback(() => {
        console.log('ANIMATE ITEMS');

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

        console.log('testttt' + itemsRef.current.length); // is always 0


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

                    console.log(`${item.id}: ${leftPosition}% ${topPosition}%`); // these items have the values of the active items a click before. I need the new once. Does that have to do something with the callback?

                    tl.fromTo(elem,
                        {
                            top: '50%',
                            left: '50%',
                            opacity: 0,
                            filter: 'blur(4px)',
                            scale: 0.1,
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none'
                        },
                        {
                            duration: 1.5,
                            opacity: 1,
                            filter: 'blur(0px)',
                            top: topPosition,
                            left: leftPosition,
                            scale: 1,
                            pointerEvents: 'all',
                            ease: 'power2.out',
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
                        pointerEvents: 'none',
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

    const animateLatest = useCallback(() => {
        console.log('ANIMATE LATEST');
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

        console.log('testttt' + itemsRef.current.length); // is always 0


        // GSAP animation with ScrollTrigger for the rest of the elements
        if (itemsRef.current.length > 0) {
            const tlhome = gsap.timeline();

            itemsRef.current.forEach((elem, index) => {
                const item = uploadedItems[index];
                if (item) {
                    const leftPosition = item.rating
                        ? `${item.rating}%`
                        : `${Math.floor(Math.random() * 100) + 1}%`;

                    let randomPosition = 0;
                    if (item.rating > 25 && item.rating < 75) {
                        // Generate a random number between 0-35 or 80-100
                        randomPosition = Math.random() < 0.5 ?
                            Math.floor(Math.random() * 25) :  // 0-35
                            Math.floor(Math.random() * 20) + 80;  // 80-100
                    } else {
                        randomPosition = Math.floor(Math.random() * 100) + 1;
                    }
                    const topPosition = `${randomPosition}%`;

                    console.log(`${item.id}: ${leftPosition}% ${topPosition}%`); // these items have the values of the active items a click before. I need the new once. Does that have to do something with the callback?

                    tlhome.fromTo(elem,
                        {
                            top: topPosition,
                            left: leftPosition,
                            opacity: 0,
                            filter: 'blur(4px)',
                            scale: 0.75,
                            pointerEvents: 'none'
                        },
                        {
                            duration: 1,
                            opacity: 1,
                            filter: 'blur(0px)',
                            scale: 1,
                            pointerEvents: 'all',
                            ease: 'power2.out',
                        }, '-=0.75');
                }
            });
        }
    }, [uploadedItems]);

    useEffect(() => {
        if (categoryAnimate && uploadedItems.length > 0) {
            animateItems();
            //setCategoryAnimate(false);
        }
    }, [categoryAnimate, uploadedItems, animateItems]);

    useEffect(() => {
        if (latestAnimate && uploadedItems.length > 0) {
            animateLatest();
        }
    }, [latestAnimate, uploadedItems, animateLatest]);

    // Hover animation for uploaded items
    const handleMouseEnter = (index: number) => {
        // Scale and highlight the hovered item
        gsap.to(itemsRef.current[index], {
            scale: 1.2,
            opacity: 1,
            filter: 'blur(0px), brightness()',
            zIndex: 10,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Darken all other items
        itemsRef.current.forEach((elem, i) => {
            if (i !== index) {
                gsap.to(elem, {
                    filter: 'brightness(50%)',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    };

    const handleMouseLeave = (index: number) => {
        // Reset the hovered item
        gsap.to(itemsRef.current[index], {
            scale: 1,
            zIndex: 1,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Reset all other items
        itemsRef.current.forEach((elem, i) => {
            gsap.to(elem, {
                filter: 'brightness(100%)',
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    };

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

        // Fetch items and animate them
        fetchItems(category);

        if (category) {
            setCategoryAnimate(true);
            setLatestAnimate(false);
        } else {
            setLatestAnimate(true);
            setCategoryAnimate(false);
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
                            }}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                        >
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
            <div className={`path-bg ${latestAnimate ? 'path-bg-small' : ''}`}></div>
            <div className="bg-video">
                <video autoPlay loop muted playsInline>
                    <source src="/loop.mp4" type="video/mp4"/>
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="home__buttons">
                <div className={`btn btn-secondary ${selectedCategory === null ? 'active' : ''}`}
                     onClick={() => handleCategoryClick(null)}>Latest
                </div>

                {categories.map((category) => (
                    <div key={category.id}
                         className={`btn btn-secondary ${selectedCategory === category.id ? 'active' : ''}`}
                         onClick={() => handleCategoryClick(category.id)}>
                        {category.categoryName}
                    </div>
                ))}
            </div>

            <HomeModal isOpen={isHomeModalOpen} onClose={handleCloseHomeModal}/>
        </main>
    );
}
