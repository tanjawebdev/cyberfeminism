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

interface ExistingItem {
    id: string;
    name: string;
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
    const [existingItems, setExistingItems] = useState<ExistingItem[]>([]);
    const [closestMatch, setClosestMatch] = useState<string>('');
    const [closestMatchId, setClosestMatchId] = useState<string>('');
    const [imageURL, setImageURL] = useState<string>('');
    const [confirmImage, setConfirmImage] = useState<boolean>(false);
    const [showButtons, setShowButtons] = useState<boolean>(false);

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
            const itemsData = itemsSnapshot.docs.map(doc => ({
                id: doc.data().id,  // Use custom ID field
                name: doc.data().name
            })) as ExistingItem[];
            setExistingItems(itemsData);
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
            if (leven(newName, closest) <= 2) {
                setClosestMatch(closest);
                setShowButtons(true);

                const matchedItem = existingItems.find(item => item.name === closest);
                setClosestMatchId(matchedItem ? matchedItem.id : '');
            } else {
                setClosestMatch('');
                setClosestMatchId('');
                setShowButtons(false);
            }
        } else {
            setClosestMatch('');
            setClosestMatchId('');
            setShowButtons(false);
        }
    };

    const handleIndividualSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIndividualSliderValue(parseInt(e.target.value, 10));
    };

    const generateRandomSliderValue = (sliderValue: number): number => {
        let randomPosition = 0;
        if (sliderValue > 25 && sliderValue < 75) {
            // Generate a random number between 0-25 or 80-100
            randomPosition = Math.random() < 0.5 ?
                Math.floor(Math.random() * 25) :  // 0-25
                Math.floor(Math.random() * 20) + 80;  // 80-100
        } else {
            randomPosition = Math.floor(Math.random() * 100) + 1;
        }
        return randomPosition;
    };


    const handleEditExisting = () => {
        if (closestMatchId) {
            router.push(`/voting/edit-item?id=${closestMatchId}`);
        } else {
            console.error('No matching item found');
        }
    };

    const handleAddItem = () => {
        setShowButtons(false);
    };

    const handleCancelName = () => {
        setName('');
        setShowButtons(false);
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

        const randomPosition = generateRandomSliderValue(sliderValue);

        setUploading(true);

        try {
            let fileUrl = '';

            if (file) {
                const fileRef = ref(storage, `uploads/${file.name}`);
                await uploadBytes(fileRef, file);
                fileUrl = await getDownloadURL(fileRef);
            } else if (imageURL) {
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
                    randomRating: randomPosition,
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
                        An item with name <strong>&quot;{closestMatch}&quot;</strong> is already existing.
                    </p>
                )}
                {showButtons && (
                    <div className="name-buttons">
                        <button type="button" className="btn btn-secondary" onClick={handleEditExisting}>Edit Existing Item</button>
                        <button type="button" className="btn btn-secondary" onClick={handleAddItem}>Add Item</button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancelName}>Cancel</button>
                    </div>
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
                <button type="button" onClick={handleGoogleSearch} className="form-group file-upload-item upload-google-image"></button>

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
