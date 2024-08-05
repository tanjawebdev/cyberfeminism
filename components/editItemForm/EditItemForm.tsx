'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import './EditItemForm.scss';

interface ItemData {
    fileUrl: string;
    category: string;
    rating: number;
    individualRating: number;
    id: number;
    name: string;
    createdAt: any;
    editedAt: any;
    sortDate: any;
    allRatings: number[];
    allIndividualRatings: number[];
}

interface CategoryData {
    id: string;
    categoryName: string;
    individualSliderHeadline: string;
    individualSliderMinTitle: string;
    individualSliderMaxTitle: string;
}

const EditItemForm: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = parseInt(searchParams.get('id') || '', 10);

    const [itemData, setItemData] = useState<ItemData | null>(null);
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [individualSliderValue, setIndividualSliderValue] = useState<number>(50);
    const [updating, setUpdating] = useState<boolean>(false);
    const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
    const [categories, setCategories] = useState<CategoryData[]>([]);

    useEffect(() => {
        // Fetch all categories from Firestore
        const fetchCategories = async () => {
            const categoriesRef = collection(db, 'categories');
            const categorySnapshot = await getDocs(categoriesRef);
            const categoriesData = categorySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as CategoryData[];
            setCategories(categoriesData);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchItem = async () => {
                const itemsRef = collection(db, 'items');
                const q = query(itemsRef, where('id', '==', id));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const documentSnapshot = querySnapshot.docs[0];
                    const data = documentSnapshot.data() as ItemData;
                    setItemData({
                        ...data,
                        sortDate: data.sortDate?.toDate(),
                        createdAt: data.createdAt?.toDate(),
                        editedAt: data.editedAt?.toDate()
                    });
                    setSliderValue(data.rating); // Initialize slider with current rating
                    setIndividualSliderValue(data.individualRating);

                    // Fetch category data from Firestore
                    const categoryDocRef = doc(db, 'categories', data.category);
                    const categoryDoc = await getDoc(categoryDocRef);
                    if (categoryDoc.exists()) {
                        setCategoryData(categoryDoc.data() as CategoryData);
                    } else {
                        console.error('No such category document!');
                    }
                } else {
                    console.error('No such document!');
                }
            };
            fetchItem();
        }
    }, [id]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(parseInt(e.target.value, 10));
    };

    const handleIndividualSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIndividualSliderValue(parseInt(e.target.value, 10));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const itemsRef = collection(db, 'items');
            const q = query(itemsRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                const currentData = querySnapshot.docs[0].data() as ItemData;

                // Update the allRatings array with the new slider value
                const updatedRatings = [...currentData.allRatings, sliderValue];
                const updatedIndividualRatings = [...currentData.allIndividualRatings, individualSliderValue];
                const averageRating = Math.round(updatedRatings.reduce((acc, rating) => acc + rating, 0) / updatedRatings.length);
                const averageIndividualRating = Math.round(updatedIndividualRatings.reduce((acc, rating) => acc + rating, 0) / updatedIndividualRatings.length);

                // Update the document with the new average rating and the updated allRatings array
                await updateDoc(docRef, {
                    rating: averageRating,
                    allRatings: updatedRatings,
                    individualRating: averageIndividualRating,
                    allIndividualRatings: updatedIndividualRatings,
                    editedAt: new Date(),
                    sortDate: new Date(),
                });

                alert('Rating value updated successfully!');
                router.push('/voting');
            } else {
                console.error('No such document!');
            }
        } catch (error) {
            console.error('Error updating slider value: ', error);
            alert('Error updating slider value.');
        } finally {
            setUpdating(false);
        }
    };

    const getCategoryName = (categoryId: string): string => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.categoryName : 'Unknown';
    };

    if (!itemData) return <p>Loading...</p>;

    return (
        <form onSubmit={handleSubmit}
              className="editItemForm">
            <div className="form-group">
                <div className="image-uploaded">
                    <img src={itemData.fileUrl} alt="Uploaded Item" className="uploaded-image"/>
                </div>
            </div>

            <div className="form-group slider">
                <div className="rating-container">
                    <label htmlFor="slider">How misogynistic is it?</label>
                    <span className="range-value">{sliderValue}%</span>
                </div>
                <div className="rating-container">
                    <input
                        type="range"
                        id="slider"
                        className="range-input"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={handleSliderChange}
                    />
                </div>
                <div className="rating-container slider-titles">
                    <span>feminist</span>
                    <span>sexist</span>
                </div>
            </div>


            {categoryData && (
                <div className="form-group slider">
                    <div className="rating-container">
                        <label htmlFor="individual-slider">{categoryData?.individualSliderHeadline}</label>
                        <span className="range-value">{individualSliderValue}%</span>
                    </div>
                    <div className="rating-container">
                        <input
                            type="range"
                            id="individual-slider"
                            className="range-input"
                            min="0"
                            max="100"
                            value={individualSliderValue}
                            onChange={handleIndividualSliderChange}
                        />
                    </div>
                    <div className="rating-container slider-titles">
                        <span>{categoryData?.individualSliderMinTitle}</span>
                        <span>{categoryData?.individualSliderMaxTitle}</span>
                    </div>
                </div>
            )}

            <div className="existingData">

                <div className="form-group">
                    <span>Name:</span>
                    <p>{itemData.name}</p>
                </div>

                <div className="form-group">
                    <span>Category:</span>
                    <p>{getCategoryName(itemData.category)}</p>
                </div>

                <div className="form-group">
                    <span>ID:</span>
                    <p>{itemData.id}</p>
                </div>


                <div className="form-group">
                    <span>Last Change:</span>
                    <p>{itemData.sortDate ? itemData.sortDate.toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>

            <button type="submit" disabled={updating} className="btn btn-secondary">
                {updating ? 'Updating...' : 'Submit'}
            </button>
        </form>
    );
};

export default EditItemForm;
