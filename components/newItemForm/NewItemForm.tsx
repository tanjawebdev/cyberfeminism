'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, runTransaction, getDoc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import leven from 'leven';
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
    const [name, setName] = useState<string>('');
    const [file, setFile] = useState<FileType | null>(null);
    const [dropdownValue, setDropdownValue] = useState<string>('');
    const [sliderValue, setSliderValue] = useState<number>(50);
    const [individualSliderValue, setIndividualSliderValue] = useState<number>(50);
    const [uploading, setUploading] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
    const [existingNames, setExistingNames] = useState<string[]>([]);
    const [closestMatch, setClosestMatch] = useState<string>('');

    useEffect(() => {
        const fetchCategoriesAndNames = async () => {
            const categoriesRef = collection(db, 'categories');
            const categorySnapshot = await getDocs(categoriesRef);
            const categoriesData = categorySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as CategoryData[];
            setCategories(categoriesData);

            const itemsRef = collection(db, 'items');
            const itemsSnapshot = await getDocs(itemsRef);
            const itemNames = itemsSnapshot.docs
                .map(doc => doc.data().name)
                .filter(name => name) as string[];
            setExistingNames(itemNames);
        };

        fetchCategoriesAndNames();
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

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);

        if (newName && existingNames.length > 0) {
            const closest = existingNames.reduce((a, b) =>
                leven(newName, a) < leven(newName, b) ? a : b
            );
            setClosestMatch(leven(newName, closest) <= 3 ? closest : '');
        } else {
            setClosestMatch('');
        }
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

        if (!name) {
            alert('Please enter a name.');
            return;
        }

        setUploading(true);

        try {
            // Upload file to Firebase Storage
            const fileRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);

            const resizedFileName = file.name.replace(/\.[^/.]+$/, "") + "_350x350.webp";
            const resizedFileRef = ref(storage, `uploads/${resizedFileName}`);

            await new Promise(resolve => setTimeout(resolve, 5000));
            const resizedFileUrl = await getDownloadURL(resizedFileRef);


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
                    name,
                    fileUrl: resizedFileUrl,
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
            setName('');
            setDropdownValue('');
            setSliderValue(50);
            setIndividualSliderValue(50);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="newItemForm">
            <div className="form-group">
                <input
                    type="text"
                    id="name"
                    placeholder="Name of the item*"
                    value={name}
                    onChange={handleNameChange}
                    required
                />
                {closestMatch && (
                    <p className="closest-match">
                        An item with name <strong>&quot;{closestMatch}&quot;</strong> is already existing. <br/>
                        Edit Existing. Continue with new Item. Quit.
                    </p>
                )}
            </div>


            <div className="form-group">
                <select id="dropdown" value={dropdownValue} onChange={handleDropdownChange} required>
                    <option value="" disabled>
                        Category*
                    </option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            /*google api file upload*/

            <div className="form-group">
                <label htmlFor="file-upload">Choose Item Image:</label>
                <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>


            <h3>Your Ratings</h3>
            <div className="form-group slider">
                <div className="rating-container">
                    <label htmlFor="slider">How misogynistic is it?</label>
                    <span>{sliderValue}</span>
                </div>
                <div className="rating-container">
                    <input
                        type="range"
                        id="slider"
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
                        <span>{individualSliderValue}</span>
                    </div>
                    <div className="rating-container">
                        <input
                            type="range"
                            id="individual-slider"
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

            <button type="submit" disabled={uploading} className="btn btn-secondary">
                {uploading ? 'Uploading...' : 'Submit'}
            </button>
        </form>
    );
};

export default NewItemForm;
