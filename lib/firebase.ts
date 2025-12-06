import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";

// TODO: User needs to replace these with their own config
const firebaseConfig = {
    apiKey: "AIzaSyBJLaFLflEPCNadULCUDFBKSLHNoMmRkk4",
    authDomain: "thiruppugazh-storage.firebaseapp.com",
    projectId: "thiruppugazh-storage",
    storageBucket: "thiruppugazh-storage.firebasestorage.app",
    messagingSenderId: "470348799550",
    appId: "1:470348799550:web:8b2fb22e35de6c0b6bfb6f",
    measurementId: "G-1MXKJZT74X"
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
