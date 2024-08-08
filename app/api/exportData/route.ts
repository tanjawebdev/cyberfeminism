import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { Parser } from 'json2csv';

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
}

const db = getFirestore();
const bucket = getStorage().bucket();

const categoryMap: { [key: string]: string } = {
    'option1': 'Books',
    'option2': 'Brands',
    'option3': 'Memes',
    'option4': 'Famous People',
    'option5': 'TV Shows',
};

export async function GET() {
    try {
        const snapshot = await db.collection('realitems').get();
        const items = snapshot.docs.map(doc => {
            const data = doc.data();
            let sortDateFormatted = '';
            if (data.sortDate && data.sortDate.toDate) {
                const sortDate = data.sortDate.toDate(); // Convert Firestore timestamp to Date
                sortDateFormatted = `${sortDate.getDate().toString().padStart(2, '0')}.${(sortDate.getMonth() + 1).toString().padStart(2, '0')}.${sortDate.getFullYear()}`;
            } else {
                console.error('Missing or invalid sortDate for document:', doc.id);
            }
            return {
                id: data.id,
                name: data.name,
                rating: data.rating,
                individualRating: data.individualRating,
                category: categoryMap[data.category] || data.category,
                sortDate: sortDateFormatted,
            };
        });

        // Sort items by sortDate
        items.sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());

        const fields = ['id', 'name', 'rating', 'individualRating', 'category', 'sortDate'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(items);

        const numberOfItems = items.length;
        const filename = `export_ItemList${numberOfItems}.csv`;
        const filePath = join(tmpdir(), filename);
        writeFileSync(filePath, csv);

        await bucket.upload(filePath, {
            destination: `exports/${filename}`,
            metadata: {
                contentType: 'text/csv',
            },
        });

        const file = bucket.file(`exports/${filename}`);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
        });

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Error exporting data:', error);
        return NextResponse.error();
    }
}
