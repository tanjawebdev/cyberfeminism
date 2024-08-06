'use client';

import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import './ImageGallery.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import SwiperCore, { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

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
    const [currentRating, setCurrentRating] = useState<number | null>(null);
    const router = useRouter();
    const swiperRef = useRef<SwiperType | null>(null);

    const fetchLatestItems = async (category: string | null = null) => {
        const itemsRef = collection(db, 'realitems');
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

        if (items.length > 2) {
            setCurrentRating(items[2].rating);
        }
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

    useEffect(() => {
        if (swiperRef.current && latestItems.length > 0) {
            setCurrentRating(latestItems[swiperRef.current.activeIndex].rating);
        }
    }, [latestItems]);

    const handleImageClick = (id: number) => {
        router.push(`/voting/edit-item?id=${id}`);
    };

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
        fetchLatestItems(category);

        if (swiperRef.current && latestItems.length > 0) {
            setCurrentRating(latestItems[swiperRef.current.activeIndex].rating);
        }
    };

    const handleSlideChange = (swiper: SwiperType) => {
        const activeIndex = swiper.activeIndex;
        if (latestItems[activeIndex]) {
            setCurrentRating(latestItems[activeIndex].rating);
        }
    };

    const handleGalleryClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG' && target.classList.contains('image-gallery__gallery-image')) {
            const id = target.getAttribute('data-id');
            if (id) {
                handleImageClick(Number(id));
            }
        }
    };

    return (
        <div className="image-gallery">
            <div className="image-container" onClick={handleGalleryClick}>
                <span className="image-gallery__rating">⌀ Rating:</span>
                <div className="swiper-container">
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        initialSlide={2}
                        slidesPerView={5}
                        coverflowEffect={{
                            rotate: 30,
                            stretch: 10,
                            depth: 200,
                            modifier: 1,
                            slideShadows: true,
                        }}
                        pagination={true}
                        modules={[EffectCoverflow]}
                        className="mySwiper"
                        onSlideChange={handleSlideChange}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        preventClicks={false}
                        preventClicksPropagation={false}
                    >
                        {latestItems.map((item) => (
                            <SwiperSlide key={item.id}>
                                <div className="item">
                                    <div className="image-gallery__image">
                                        <img src={item.fileUrl} alt={`Item ${item.id}`}
                                             className="image-gallery__gallery-image" data-id={item.id}/>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
                <div className="rating-number">
                    <span>{currentRating !== null ? currentRating : 0}</span>% sexist
                </div>
            </div>
            <div className="categories">
                <button className={`btn btn-secondary ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(null)}>Latest</button>

                {categories.map((category) => (
                    <button key={category.id}
                            className={`btn btn-secondary ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category.id)}>
                        {category.categoryName}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
