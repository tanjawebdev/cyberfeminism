'use client';

import React, {useState, ChangeEvent, FormEvent, useEffect} from 'react';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {collection, doc, runTransaction, getDoc, getDocs} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import './NewItemForm.scss';

interface FileType extends File {
    name: string;
}

interface CategoryData {
    id: string;
    categoryName: string;
    individualSliderHeadline: string;
    individualSliderMinTitle: string;
    individualSliderMaxTitle: string;
}

const NewItemForm: React.FC = () => {
    const router = useRouter();
    const [file, setFile] = useState<FileType | null>(null);
    const [dropdownValue, setDropdownValue] = useState<string>('');
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [individualSliderValue, setIndividualSliderValue] = useState<number>(50);
    const [uploading, setUploading] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData | null>(null);

    useEffect(() => {
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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0] as FileType);
        }
    };

    const handleDropdownChange = async (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedCategory = e.target.value;
        setDropdownValue(selectedCategory);

        const categoryDocRef = doc(db, 'categories', selectedCategory);
        const categoryDoc = await getDoc(categoryDocRef);
        if (categoryDoc.exists()) {
            setCategoryData(categoryDoc.data() as CategoryData);
        } else {
            console.error('No such category document!');
        }
    };

    const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSliderValue(parseInt(e.target.value, 10));
    };

    const handleIndividualSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIndividualSliderValue(parseInt(e.target.value, 10));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            alert('Please upload a file.');
            return;
        }

        setUploading(true);

        try {
            // Upload file to Firebase Storage
            const fileRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);

            // Transaction to update counter and add new item
            await runTransaction(db, async (transaction) => {
                const counterDocRef = doc(db, 'counters', 'itemCounter');
                const counterDoc = await transaction.get(counterDocRef);
                if (!counterDoc.exists()) {
                    throw new Error('Counter document does not exist!');
                }

                const newId = counterDoc.data().currentId + 1;
                transaction.update(counterDocRef, { currentId: newId });

                const newItemRef = doc(collection(db, 'items'));
                transaction.set(newItemRef, {
                    id: newId,
                    fileUrl,
                    category: dropdownValue,
                    rating: sliderValue,
                    individualRating: individualSliderValue,
                    createdAt: new Date(),
                    sortDate: new Date(),
                    allRatings: [sliderValue],
                    allIndividualRatings: [individualSliderValue],
                });
            });

            alert('File uploaded and metadata saved successfully!');
            router.push('/voting');
        } catch (error) {
            console.error('Error uploading file and saving metadata: ', error);
            alert('Error uploading file and saving metadata.');
        } finally {
            setUploading(false);
            setFile(null);
            setDropdownValue('');
            setSliderValue(50);
            setIndividualSliderValue(50);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="file-upload">Upload Image:</label>
                <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="dropdown">Select Category:</label>
                <select id="dropdown" value={dropdownValue} onChange={handleDropdownChange} required>
                    <option value="" disabled>
                        Select an option
                    </option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.categoryName}
                        </option>
                    ))}
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

            {categoryData && (
                <>
                <div className="form-group">
                    <label htmlFor="individual-slider">{categoryData?.individualSliderHeadline}:</label>
                    <input
                        type="range"
                        id="individual-slider"
                        min="0"
                        max="100"
                        value={individualSliderValue}
                        onChange={handleIndividualSliderChange}
                    />
                    <div className="slider-titles">
                        <span>{categoryData?.individualSliderMinTitle}</span>
                        <span>{categoryData?.individualSliderMaxTitle}</span>
                    </div>
                    <span>{individualSliderValue}</span>
                </div>
                </>
            )}

            <button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Submit'}
            </button>
        </form>
    );
};

export default NewItemForm;
