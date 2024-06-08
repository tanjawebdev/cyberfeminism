import React, {useState} from 'react';
import './NewItemForm.scss';

const NewItemForm = () => {
    const [file, setFile] = useState(null);
    const [dropdownValue, setDropdownValue] = useState('');
    const [sliderValue, setSliderValue] = useState(50);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDropdownChange = (e) => {
        setDropdownValue(e.target.value);
    };

    const handleSliderChange = (e) => {
        setSliderValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission (e.g., send data to API or update state)
        console.log('Submitted:', {
            file,
            dropdownValue,
            sliderValue,
        });
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

            <button type="submit">Submit</button>
        </form>
    );
};

export default NewItemForm;
