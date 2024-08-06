import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { fetchGoogleImage } from "lib/googleSearch"; // Import the function
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, runTransaction, getDoc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import leven from 'leven';
import './NewItemForm.scss';
import { TfiClose } from "react-icons/tfi";

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
    const [imageURL, setImageURL] = useState<string>('');
    const [confirmImage, setConfirmImage] = useState<boolean>(false);

    useEffect(() => {
        const fetchCategoriesAndNames = async () => {
            const categoriesRef = collection(db, 'categories');
            const categorySnapshot = await getDocs(categoriesRef);
            const categoriesData = categorySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as CategoryData[];
            setCategories(categoriesData);

            const itemsRef = collection(db, 'realitems');
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

    const handleRemoveFile = () => {
        setFile(null);
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
            setClosestMatch(leven(newName, closest) <= 1.7 ? closest : '');
        } else {
            setClosestMatch('');
        }
    };

    const handleIndividualSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIndividualSliderValue(parseInt(e.target.value, 10));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file && !imageURL) {
            alert('Please upload a file or select a recommended image.');
            return;
        }

        if (!name) {
            alert('Please enter a name.');
            return;
        }

        setUploading(true);

        try {
            let fileUrl = '';

            if (file) {
                // Upload file to Firebase Storage
                const fileRef = ref(storage, `uploads/${file.name}`);
                await uploadBytes(fileRef, file);
                fileUrl = await getDownloadURL(fileRef);
            } else if (imageURL) {
                // Send the image URL and name to the API route
                const response = await fetch('/api/uploadImage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageUrl: imageURL, name })
                });
                const data = await response.json();
                if (response.ok) {
                    fileUrl = data.fileUrl;
                } else {
                    throw new Error(data.error);
                }
            }

            const [urlPath, urlParams] = fileUrl.split('?');
            const urlParts = urlPath.split('/');
            const fileName = urlParts.pop() as string;
            const newFileName = fileName.replace(/\.[^/.]+$/, "_350x350.webp");
            const resizedFileUrl = [...urlParts, newFileName].join('/') + (urlParams ? `?${urlParams}` : '');

            // Transaction to update counter and add new item
            await runTransaction(db, async (transaction) => {
                const counterDocRef = doc(db, 'counters', 'realItemCounter');
                const counterDoc = await transaction.get(counterDocRef);
                if (!counterDoc.exists()) {
                    throw new Error('Counter document does not exist!');
                }

                const newId = counterDoc.data().currentId + 1;
                transaction.update(counterDocRef, { currentId: newId });

                const newItemRef = doc(collection(db, 'realitems'));
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

            alert('Media item successfully added!');
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
            setImageURL('');
            setConfirmImage(false);
        }
    };

    const handleGoogleSearch = async () => {
        if (!name || !dropdownValue) {
            alert('Please enter a name and select a category.');
            return;
        }

        const category = categories.find(cat => cat.id === dropdownValue);
        if (!category) {
            alert('Invalid category.');
            return;
        }

        const searchQuery = `${category.categoryName} ${name}`;
        const image = await fetchGoogleImage(searchQuery);
        if (image) {
            setImageURL(image);
            setConfirmImage(true);
        } else {
            alert('No image found.');
        }
    };

    const handleAcceptImage = () => {
        setConfirmImage(false);
    };

    const handleCancelImage = () => {
        setImageURL('');
        setConfirmImage(false);
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

            <div className="upload-wrap">
                <span className="chooseImage">Choose Item Image*</span>
                <button type="button" onClick={handleGoogleSearch} className="form-group file-upload-item upload-google-image">
                </button>

                {imageURL && confirmImage && (
                    <div className="form-group googleImage-wrapper">
                        <img className="googleImage" src={imageURL} alt="Google Image" style={{ maxWidth: '100%' }} />
                        <div className="confirm-buttons">
                            <button type="button" className="btn btn-secondary" onClick={handleAcceptImage}>Accept</button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancelImage}>Cancel</button>
                        </div>
                    </div>
                )}

                {imageURL && !confirmImage && (
                    <div className="form-group googleImage-confirmed">
                        <span>Your image:</span>
                        <img src={imageURL} alt="Google Image" style={{ maxWidth: '100%' }} />
                    </div>
                )}
                <span className="upload-or">OR</span>
                <div className="form-group file-upload-item">
                    <input
                        type="file"
                        id="file-upload"
                        accept=".jpeg, .jpg, .png"
                        onChange={handleFileChange}
                    />
                    {file && (
                        <div className="file-info">
                            <span>{file.name}</span>
                            <button type="button" className="close-button" onClick={handleRemoveFile}>
                                <TfiClose />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3>Your Ratings</h3>
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

            <button type="submit" disabled={uploading} className="btn btn-secondary">
                {uploading ? 'Uploading...' : 'Submit'}
            </button>
        </form>
    );
};

export default NewItemForm;
