import React, { useState } from 'react';
import { storage, db } from '@/lib/firebase'; // Adjust the import path as needed
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import './NewItemForm.scss';

const NewItemForm = () => {
    const [file, setFile] = useState(null);
    const [dropdownValue, setDropdownValue] = useState('');
    const [sliderValue, setSliderValue] = useState(50);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDropdownChange = (e) => {
        setDropdownValue(e.target.value);
    };

    const handleSliderChange = (e) => {
        setSliderValue(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please upload a file.");
            return;
        }

        setUploading(true);

        try {
            // Upload file to Firebase Storage
            const fileRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);

            // Save metadata to Firestore
            await addDoc(collection(db, 'items'), {
                fileUrl,
                category: dropdownValue,
                rating: sliderValue,
                createdAt: new Date(),
            });

            alert("File uploaded and metadata saved successfully!");
        } catch (error) {
            console.error("Error uploading file and saving metadata: ", error);
            alert("Error uploading file and saving metadata.");
        } finally {
            setUploading(false);
            setFile(null);
            setDropdownValue('');
            setSliderValue(50);
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
                <select id="dropdown" value={dropdownValue} onChange={handleDropdownChange}>
                    <option value="" disabled>Select an option</option>
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

            <button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Submit"}
            </button>
        </form>
    );
};

export default NewItemForm;
