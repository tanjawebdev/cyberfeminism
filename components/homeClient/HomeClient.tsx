'use client';

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
} from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Scroller from '@/components/scroller/Scroller';
import HomeModal from '@/components/homeModal/HomeModal';
import '@styles/home.scss';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Die Interfaces beschreiben die Struktur deiner JSON-Daten
export interface UploadedItem {
    fileUrl: string;
    category: string;
    rating: number;
    individualRating: number;
    randomRating: number;
    id: number;
    // sortDate ist in deinem JSON bereits sortiert, daher hier einfach string
    sortDate: string;
    allRatings: number[];
}

export interface CategoryData {
    id: string;
    categoryName: string;
    individualSliderHeadline: string;
    individualSliderMinTitle: string;
    individualSliderMaxTitle: string;
    individualSliderMaxTitleShort: string;
    individualQuestion: string;
}

interface DelayedItemProps {
    item: UploadedItem;
    index: number;
    itemsRef: React.MutableRefObject<HTMLDivElement[]>;
}

interface Props {
    initialItems: UploadedItem[];
    initialCategories: CategoryData[];
}

const HomeClient: React.FC<Props> = ({
                                         initialItems,
                                         initialCategories,
                                     }) => {
    // States initial aus den Props
    const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>(initialItems);
    const [categories] = useState<CategoryData[]>(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isHomeModalOpen, setHomeModalOpen] = useState<boolean>(false);
    const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
    const itemsRef = useRef<HTMLDivElement[]>([]);
    const [categoryAnimate, setCategoryAnimate] = useState(false);
    const [latestAnimate, setLatestAnimate] = useState(false);
    const [scrollerKey, setScrollerKey] = useState(0);

    // Animation für Kategorie-Auswahl
    const animateItems = useCallback(() => {
        gsap.killTweensOf(itemsRef.current);
        ScrollTrigger.getAll().forEach(t => t.kill());

        gsap.fromTo(
            '.headertext',
            { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }
        );

        if (itemsRef.current.length > 0) {
            const tl = gsap.timeline();
            itemsRef.current.forEach((elem, i) => {
                const item = uploadedItems[i];
                const topPos = item.individualRating
                    ? `calc(100% - ${item.individualRating}%)`
                    : `${Math.random() * 100}%`;
                const leftPos = item.rating != null
                    ? `${item.rating}%`
                    : `${Math.random() * 100}%`;

                tl.fromTo(
                    elem,
                    { top: '50%', left: '50%', opacity: 0, filter: 'blur(4px)', scale: 0.1, transform: 'translate(-50%, -50%)', pointerEvents: 'none' },
                    {
                        top: topPos,
                        left: leftPos,
                        opacity: 1,
                        filter: 'blur(0px)',
                        scale: 1,
                        ease: 'power2.out',
                        duration: 1.5,
                        onComplete: () => { elem.style.pointerEvents = 'all'; },
                    },
                    '-=1'
                );
                if (i === 4) {
                    tl.to(
                        '.headertext',
                        { opacity: 0, scale: 0.8, filter: 'blur(10px)', duration: 1, ease: 'power2.in' },
                        `-=${1.5}`
                    );
                }
                if (i >= 8) {
                    const toFade = itemsRef.current[i - 8];
                    tl.to(
                        toFade,
                        { opacity: 0, pointerEvents: 'none', duration: 1, ease: 'power2.out' },
                        `-=${1.5}`
                    );
                }
            });

            ScrollTrigger.create({
                animation: tl,
                trigger: '.path-bg',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 2,
                anticipatePin: 1,
            });
            ScrollTrigger.refresh();
        }
    }, [uploadedItems]);

    // Animation für "Latest"
    const animateLatest = useCallback(() => {
        gsap.killTweensOf(itemsRef.current);
        ScrollTrigger.getAll().forEach(t => t.kill());

        gsap.fromTo(
            '.headertext',
            { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }
        );

        if (itemsRef.current.length > 0) {
            const tl = gsap.timeline();
            itemsRef.current.forEach((elem, i) => {
                const item = uploadedItems[i];
                const leftPos = item.rating != null ? `${item.rating}%` : `${Math.random() * 100}%`;
                const topPos = item.randomRating != null
                    ? `${item.randomRating}%`
                    : `${Math.random() * 100}%`;
                tl.fromTo(
                    elem,
                    { top: topPos, left: leftPos, opacity: 0, filter: 'blur(4px)', scale: 0.75, pointerEvents: 'none' },
                    {
                        opacity: 1,
                        filter: 'blur(0px)',
                        scale: 1,
                        pointerEvents: 'all',
                        ease: 'power2.out',
                        duration: 1,
                    },
                    '-=0.75'
                );
            });
        }
    }, [uploadedItems]);

    useEffect(() => {
        if (categoryAnimate && uploadedItems.length > 0) {
            animateItems();
        }
    }, [categoryAnimate, uploadedItems, animateItems]);

    useEffect(() => {
        if (latestAnimate && uploadedItems.length > 0) {
            animateLatest();
        }
    }, [latestAnimate, uploadedItems, animateLatest]);

    // Hover-Effekte
    const handleMouseEnter = (idx: number) => {
        gsap.to(itemsRef.current[idx], { scale: 1.2, opacity: 1, filter: 'brightness(100%)', zIndex: 10, duration: 0.3 });
        itemsRef.current.forEach((el, i) => {
            if (i !== idx) {
                gsap.to(el, { filter: 'brightness(50%)', duration: 0.3 });
            }
        });
    };
    const handleMouseLeave = (idx: number) => {
        gsap.to(itemsRef.current[idx], { scale: 1, zIndex: 1, duration: 0.3 });
        itemsRef.current.forEach(el => {
            gsap.to(el, { filter: 'brightness(100%)', duration: 0.3 });
        });
    };

    // Kategorien-Wechsel
    const handleCategoryClick = (category: string | null) => {
        const header = document.querySelector('.headertext') as HTMLElement;
        if (header) header.style.opacity = '0';

        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        setScrollerKey(k => k + 1);

        gsap.killTweensOf(itemsRef.current);
        ScrollTrigger.getAll().forEach(t => t.kill());

        itemsRef.current = [];
        setSelectedCategory(category);

        // filtere aus dem statischen Snapshot
        const filtered = category
            ? initialItems.filter(i => i.category === category)
            : initialItems;
        setUploadedItems(filtered.slice(0, 15));

        const catData = category
            ? initialCategories.find(c => c.id === category) || null
            : null;
        setCategoryData(catData);

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
        handleCategoryClick(null);
    };
    const startScrolling = () => {
        window.scrollTo({ top: 3000, left: 0, behavior: 'smooth' });
    };

    // Einzeiliges DelayedItem für Bilder
    const DelayedItem: React.FC<DelayedItemProps> = ({ item, index, itemsRef }) => {
        const [src, setSrc] = useState<string | null>(null);
        useEffect(() => {
            const fn = item.fileUrl.split('/').pop();
            setSrc(fn ? `/images/${fn}` : null);
        }, [item.fileUrl]);

        return (
            <div
                className="uploadedItem"
                ref={el => { if (el) itemsRef.current[index] = el; }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                style={{ visibility: 'hidden' }}
            >
                {src ? (
                    <img
                        src={src}
                        alt=""
                        className="item-image"
                        onLoad={e => { itemsRef.current[index]?.style.setProperty('visibility', 'visible'); }}
                    />
                ) : (
                    <p>Loading…</p>
                )}
                <div className="item-info">
                    <div className="item-details first-line">
                        <p>⌀ Rating ({item.allRatings.length}):</p>
                        <p>ID: {item.id}</p>
                    </div>
                    <div className="item-details second-line">
                        <p>{item.rating}% sexist</p>
                        {categoryData && (
                            <p>
                                {item.individualRating}% {categoryData.individualSliderMaxTitleShort}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="home">
            <div className="home__logo">
                <Image src="/icons/logo.svg" alt="Logo" width={160} height={70} />
            </div>

            <div className="home__scroller">
                {selectedCategory != null && (
                    <Scroller
                        key={scrollerKey}
                        min={0}
                        max={100}
                        step={1}
                        initialValue={0}
                    />
                )}
            </div>

            <div className="home__coordinate-system">
                <span className="left">feminist</span>
                <span className="right">sexist</span>
                <span className="top">{categoryData?.individualSliderMaxTitle || ''}</span>
                <span className="bottom">{categoryData?.individualSliderMinTitle || ''}</span>
            </div>

            <div className="home__home-pager">
                {selectedCategory == null ? (
                    <>
                        <span className="text">Most recent items shown:</span>
                        <span className="number">15</span>
                    </>
                ) : (
                    <span className="text">scroll through uploads</span>
                )}
            </div>

            <div className="home__container">
                <div className="home__uploadedItems">
                    <div className="headertext">
                        {selectedCategory == null && (
                            <span className="cat-summary">Your latest submissions</span>
                        )}
                        <h1 className="cat-headline">
                            {categoryData?.individualQuestion ||
                                'Ra(n)ting: How Sexist Is The Media?'}
                        </h1>
                        {selectedCategory == null ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => handleCategoryClick('option1')}
                            >
                                Start Exploring
                            </button>
                        ) : (
                            <div className="scroll-hint" onClick={startScrolling}>
                                <span>See your submissions</span>
                                <svg className="arrows">
                                    <path className="a1" d="M0 0 L30 32 L60 0" />
                                    <path className="a2" d="M0 20 L30 52 L60 20" />
                                    <path className="a3" d="M0 40 L30 72 L60 40" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {uploadedItems.map((item, idx) => (
                        <DelayedItem
                            key={idx}
                            item={item}
                            index={idx}
                            itemsRef={itemsRef}
                        />
                    ))}
                </div>
            </div>

            <div className={`path-bg ${latestAnimate ? 'path-bg-small' : ''}`} />
            <div className="bg-video">
                <video autoPlay loop muted playsInline>
                    <source src="/loop.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="home__buttons">
                <div
                    className={`btn btn-secondary ${
                        selectedCategory == null ? 'active' : ''
                    }`}
                    onClick={() => handleCategoryClick(null)}
                >
                    Latest
                </div>
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        className={`btn btn-secondary ${
                            selectedCategory === cat.id ? 'active' : ''
                        }`}
                        onClick={() => handleCategoryClick(cat.id)}
                    >
                        {cat.categoryName}
                    </div>
                ))}
            </div>

            <HomeModal isOpen={isHomeModalOpen} onClose={handleCloseHomeModal} />
        </main>
    );
};

export default HomeClient;