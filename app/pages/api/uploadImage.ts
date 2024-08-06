import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default async function handler(req: { method: string; body: { imageUrl: any; name: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; fileUrl?: string; }): void; new(): any; }; }; }) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageUrl, name } = req.body;

    if (!imageUrl || !name) {
        return res.status(400).json({ error: 'Missing imageUrl or name' });
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

        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error('Error fetching or uploading image: ', error);
        res.status(500).json({ error: 'Error fetching or uploading image' });
    }
}
