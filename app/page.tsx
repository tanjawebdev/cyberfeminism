'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import variables from "@styles/variables.module.scss";

export default function Home() {
    const [uploadedItems, setUploadedItems] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
            const items = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    createdAt: data.createdAt.toDate(), // Convert Firestore timestamp to JavaScript Date
                };
            });
            setUploadedItems(items);
        });

        return () => unsubscribe();
    }, []);

    return (
        <main>
            <div className={variables.title}>Startscreen</div>
            <div className="container">
                <div className="uploadedItems">
                    {uploadedItems.map((item, index) => (
                        <div key={index} className="uploadedItem">
                            <Image
                                src={item.fileUrl}
                                alt={`Uploaded Item ${index + 1}`}
                                width={200}
                                height={200}
                            />
                            <p>Category: {item.category}</p>
                            <p>Rating: {item.rating}</p>
                            <p>ID: {item.id}</p>
                            <p>Created: {item.createdAt.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className="grid">
                    <div className="g-col-md-4">Test</div>
                    <div className="g-col-md-4">Test</div>
                    <div className="g-col-md-4">Test</div>
                </div>
            </div>
        </main>
    );
}
