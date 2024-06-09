'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import './EditItemForm.scss';

interface ItemData {
    fileUrl: string;
    category: string;
    rating: number;
    id: number;
    createdAt: any; // Firestore timestamp, we will convert it later
}

const EditItemForm: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = parseInt(searchParams.get('id') || '', 10);

    const [itemData, setItemData] = useState<ItemData | null>(null);
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [updating, setUpdating] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            const fetchItem = async () => {
                const itemsRef = collection(db, 'items');
                const q = query(itemsRef, where('id', '==', id));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const data = doc.data() as ItemData;
                    setItemData(data);
                    setSliderValue(data.rating); // Initialize slider with current rating
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const itemsRef = collection(db, 'items');
            const q = query(itemsRef, where('id', '==', id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await updateDoc(docRef, {
                    rating: sliderValue,
                });

                alert('Slider value updated successfully!');
                router.push('/voting'); // Redirect to voting page after update
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

    if (!itemData) return <p>Loading...</p>;

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="file-upload">Upload Image:</label>
                <input type="file" id="file-upload" accept="image/*" disabled />
            </div>

            <div className="form-group">
                <label htmlFor="dropdown">Select Category:</label>
                <select id="dropdown" value={itemData.category} disabled>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="slider">Rating:</label>
                <input
                    type="range"
                    id="slider"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                />
                <span>{sliderValue}</span>
            </div>

            <button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Submit'}
            </button>
        </form>
    );
};

export default EditItemForm;
