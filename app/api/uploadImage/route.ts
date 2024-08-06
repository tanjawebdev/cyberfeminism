import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(req: NextRequest) {
    const { imageUrl, name } = await req.json();

    if (!imageUrl || !name) {
        return NextResponse.json({ error: 'Missing imageUrl or name' }, { status: 400 });
    }

    try {
        // Fetch the image
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Upload the image to Firebase Storage
        const fileName = `${name.replace(/\s+/g, '_')}.jpg`;
        const fileRef = ref(storage, `uploads/${fileName}`);
        await uploadBytes(fileRef, blob);

        const fileUrl = await getDownloadURL(fileRef);

        return NextResponse.json({ fileUrl });
    } catch (error) {
        console.error('Error fetching or uploading image: ', error);
        return NextResponse.json({ error: 'Error fetching or uploading image' }, { status: 500 });
    }
}
