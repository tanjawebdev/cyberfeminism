export const fetchGoogleImage = async (query: string | number | boolean) => {
    const apiKey = 'AIzaSyCmZI_O_ka48pHE5ckTSN5U5Lcmz4vjHOk';
    const searchEngineId = '877264bce3d514a1c';
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${searchEngineId}&fileType=jpg&searchType=image&key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const firstImage = data.items && data.items[0] && data.items[0].link;
        return firstImage;
    } catch (error) {
        console.error('Error fetching Google image:', error);
        return null;
    }
};