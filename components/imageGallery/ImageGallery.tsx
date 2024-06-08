import React from 'react';
import './ImageGallery.scss';

const ImageGallery = () => {
    return (
        <div className="imageGallery">
            <div className="container">
                <div className="grid">
                    <div className="g-col-md-4">Test</div>
                    <div className="g-col-md-4">Test</div>
                    <div className="g-col-md-4">Test</div>
                </div>
            </div>
            <div className="categories">
                <div className="grid">
                    <div className="g-col-md-4">All</div>
                    <div className="g-col-md-4">Memes</div>
                    <div className="g-col-md-4">Books</div>
                </div>
            </div>
        </div>
    );
};

export default ImageGallery;
