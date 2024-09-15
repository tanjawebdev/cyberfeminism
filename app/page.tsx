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
    randomRating: number;
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
    const [previousItems, setPreviousItems] = useState<UploadedItem[]>([]); // Track previous items
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isHomeModalOpen, setHomeModalOpen] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
    const itemsRef = useRef<HTMLDivElement[]>([]);
    const [categoryAnimate, setCategoryAnimate] = useState(false);
    const [latestAnimate, setLatestAnimate] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true); // New state for first load tracking


    const fetchItems = (category: string | null) => {
        const itemsRef = collection(db, 'realitems');
        let q;
        if (category) {
            q = query(itemsRef, where('category', '==', category), orderBy('sortDate', 'desc'), limit(15));
        } else {
            q = query(itemsRef, orderBy('sortDate', 'desc'), limit(15));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newItems = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    sortDate: data.sortDate?.toDate(),
                } as UploadedItem;
            });

            // Check for new items by comparing with the previous items state
            if (!isFirstLoad) {
                console.log('not first load');

                const addedItems = newItems.filter(newItem =>
                    !previousItems.some(prevItem => prevItem.id === newItem.id)
                );
                if (addedItems.length > 0) {
                    animateNewItems(addedItems); // Animate only the newly added items
                }
            }

            setUploadedItems(newItems);
            setPreviousItems(newItems); // Update the previous items for comparison

            if (isFirstLoad) {
                console.log('first load');
                setIsFirstLoad(false); // Mark that the first load has completed
                setLatestAnimate(true); // Only trigger this on the first load
            }
        });

        return () => unsubscribe();
    };

    useEffect(() => {
        // Instantly scroll to the top of the page when the component mounts
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        console.log('fetchItems');
        console.log(selectedCategory);
        const unsubscribe = fetchItems(selectedCategory);

        // maybe change here
        // only setLatestAnimate(true) on first page load
        // if fetchItem gets triggered by a new uploaded element, make a new animation that only animates in this new element

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

    const animateNewItems = (newItems: UploadedItem[]) => {
        console.log('ANIMATE NEW ITEMS');

        newItems.forEach((item, index) => {
            const elem = itemsRef.current[index];
            if (elem) {
                const leftPosition = item.rating != null && item.rating !== undefined
                    ? `${item.rating}%`
                    : `${Math.floor(Math.random() * 100) + 1}%`;

                const topPosition = item.randomRating != null && item.randomRating !== undefined
                    ? `${item.randomRating}%`
                    : `${Math.floor(Math.random() * 100) + 1}%`;

                gsap.fromTo(elem,
                    {
                        opacity: 0,
                        top: '50%',
                        left: '50%',
                        scale: 0.1,
                    },
                    {
                        duration: 1.5,
                        opacity: 1,
                        top: topPosition,
                        left: leftPosition,
                        scale: 1,
                        ease: 'power2.out',
                    }
                );
            }
        });
    };

    // GSAP animation
    const animateItems = useCallback(() => {
        console.log('ANIMATE ITEMS');

        // Clear any existing animations and scroll triggers
        gsap.killTweensOf(itemsRef.current);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());


        // Start the headline animation immediately
        gsap.fromTo(".headertext",
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

                    const leftPosition = item.rating != null && item.rating !== undefined
                        ? `${item.rating}%`
                        : `${Math.floor(Math.random() * 100) + 1}%`;

                    console.log(`${item.id}: ${leftPosition}% ${topPosition}%`);

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
                            ease: 'power2.out',
                            onComplete: () => {
                                elem.style.pointerEvents = 'all';
                            }
                        }, '-=1');
                }
                if (index === 4) {
                    tl.to(".headertext", {
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
                end: "bottom bottom",
                onLeave: () => {
                    const categories = ['option1', 'option2', 'option3', 'option4', 'option5'];
                    if (selectedCategory != null) {
                        const headerTextElement = document.querySelector('.headertext') as HTMLElement;
                        if (headerTextElement) {
                            headerTextElement.style.opacity = '0';
                        }
                        const currentIndex = categories.indexOf(selectedCategory);
                        const nextIndex = (currentIndex + 1) % categories.length;
                        const nextCategory = categories[nextIndex];
                        handleCategoryClick(nextCategory);
                    }
                },
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
        gsap.fromTo(".headertext",
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
                    const leftPosition = item.rating != null && item.rating !== undefined
                        ? `${item.rating}%`
                        : `${Math.floor(Math.random() * 100) + 1}%`;

                    const topPosition = item.randomRating != null && item.randomRating !== undefined
                        ? `${item.randomRating}%`
                        : `${Math.floor(Math.random() * 100) + 1}%`;


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
        const headerTextElement = document.querySelector('.headertext') as HTMLElement;
        if (headerTextElement) {
            headerTextElement.style.opacity = '0';
        }

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
        const unsubscribe = fetchItems(category);

        if (category) {
            setCategoryAnimate(true);
            setLatestAnimate(false);
        } else {
            setLatestAnimate(true);
            setCategoryAnimate(false);
        }
        return () => unsubscribe();
    };

    const handleOpenHomeModal = () => {
        setHomeModalOpen(true);
    };

    const handleCloseHomeModal = () => {
        setHomeModalOpen(false);
    };

    const startScrolling = () => {
        window.scrollTo({ top: 3000, left: 0, behavior: 'smooth' });
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
            <div className="home__home-pager">
                    <span className="text">Most recent items shown:</span>
                    <span className="number">15</span>
            </div>
            <div className="home__container">
                <div className="home__uploadedItems">
                    <div className="headertext">
                        {selectedCategory === null ?
                            <span className="cat-summary">
                                Your latest submissions
                            </span>
                            : ''}

                        <h1 className="cat-headline">
                            {categoryData?.individualQuestion || 'Ra(n)ting: How Sexist Is The Media?'}
                        </h1>

                        {selectedCategory === null ?
                            <button className="btn btn-primary"
                                    onClick={() => handleCategoryClick("option1")}>
                                Start Exploring
                            </button>
                            :
                            <div className="scroll-hint"
                                 onClick={startScrolling}>
                                <span>
                                    Scroll through submissions
                                </span>

                                <svg className="arrows">
                                    <path className="a1" d="M0 0 L30 32 L60 0"></path>
                                    <path className="a2" d="M0 20 L30 52 L60 20"></path>
                                    <path className="a3" d="M0 40 L30 72 L60 40"></path>
                                </svg>
                            </div>
                        }
                    </div>


                    {uploadedItems.map((item, index) => {
                        return (
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
                                style={{visibility: 'hidden'}}
                            >
                                <img src={item.fileUrl}
                                     alt="Logo"
                                     className="item-image"
                                     onLoad={(e) => {
                                         const element = itemsRef.current[index];
                                         if (element) {
                                             gsap.to(element, {visibility: 'visible'});
                                         }
                                     }}
                                />

                                <div className="item-info">
                                    <div className="item-details first-line">
                                        <p>⌀ Rating ({item.allRatings.length}):</p>
                                        <p>ID: {item.id}</p>
                                    </div>
                                    <div className="item-details second-line">
                                        <p>{item.rating}% sexist</p>
                                        {categoryData && (
                                            <p>
                                                {item.individualRating}% {categoryData?.individualSliderMaxTitleShort}
                                            </p>
                                        )}
                                    </div>
                                    <div className="item-details date-line">
                                        <p>{item.sortDate?.toLocaleDateString('de-DE')}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
