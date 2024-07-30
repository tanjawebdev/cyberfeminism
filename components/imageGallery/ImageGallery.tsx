'use client';

import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import './ImageGallery.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import SwiperCore from 'swiper';
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
    const swiperRef = useRef<SwiperCore | null>(null);

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

    const handleSlideChange = (swiper) => {
        const activeIndex = swiper.activeIndex;
        if (latestItems[activeIndex]) {
            setCurrentRating(latestItems[activeIndex].rating);
        }
    };

    return (
        <div className="image-gallery">
            <div className="image-container">
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
                    >
                        {latestItems.map((item) => (
                            <SwiperSlide key={item.id}>
                                <div className="item" onClick={() => handleImageClick(item.id)}>
                                    <div className="image-gallery__image">
                                        <img src={item.fileUrl} alt={`Item ${item.id}`}
                                             className="image-gallery__gallery-image"/>
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
