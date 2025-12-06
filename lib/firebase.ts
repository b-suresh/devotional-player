import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";

// TODO: User needs to replace these with their own config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

export const getSongUrl = async (fileName: string): Promise<string> => {
    try {
        const songRef = ref(storage, `songs/${fileName}`);
        return await getDownloadURL(songRef);
    } catch (error) {
        console.error("Error fetching song URL:", error);
        throw error;
    }
};

export const getAllSongs = async () => {
    try {
        // Try 'songs' folder first
        let listRef = ref(storage, 'songs');
        let res = await listAll(listRef);

        // If empty, try root folder (in case user uploaded directly)
        if (res.items.length === 0) {
            listRef = ref(storage, '');
            res = await listAll(listRef);
        }

        const songs = await Promise.all(
            res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return {
                    id: itemRef.name,
                    title: itemRef.name.replace(/\.mp3$/i, '').replace(/_/g, ' '),
                    fileName: itemRef.name,
                    url: url,
                    tags: [itemRef.name.toLowerCase().replace(/\.mp3$/i, '').replace(/_/g, ' ')]
                };
            })
        );
        return songs;
    } catch (error) {
        console.error("Error listing songs:", error);
        return [];
    }
};

export { storage };
