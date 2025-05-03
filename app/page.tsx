import fs from 'fs';
import path from 'path';
import HomeClient from '@/components/homeClient/HomeClient';

interface UploadedItem {
    fileUrl: string;
    category: string;
    rating: number;
    individualRating: number;
    randomRating: number;
    id: number;
    sortDate: string;
    allRatings: number[];
}

interface CategoryData {
    id: string;
    categoryName: string;
    individualSliderHeadline: string;
    individualSliderMinTitle: string;
    individualSliderMaxTitle: string;
    individualSliderMaxTitleShort: string;
    individualQuestion: string;
}

export const revalidate =  false; // optional: verhindert ISR

export default async function Page() {
    // 1) Lese deine exportierte JSON-Datei
    const jsonPath = path.join(process.cwd(), 'data', 'firestore.json');
    const { realitems, categories } = JSON.parse(
        fs.readFileSync(jsonPath, 'utf-8')
    ) as {
        realitems: UploadedItem[];
        categories: CategoryData[];
    };

    // 2) Gib sie an deine Client-Komponente weiter
    return (
        <HomeClient
            initialItems={realitems}
            initialCategories={categories}
        />
    );
}