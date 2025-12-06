const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL, getMetadata } = require("firebase/storage");
const fs = require("fs");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// --- CONFIGURATION ---
// 1. Get these from your Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 2. Path to your local songs folder
const LOCAL_SONGS_PATH = "/Users/suresh/home/songs/thiruppugazh";
// ---------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFile(filePath, fileName) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const storageRef = ref(storage, `songs/${fileName}`);

        // Check if file exists
        try {
            await getMetadata(storageRef);
            console.log(`⏭️  Skipping ${fileName} (already exists)`);
            return;
        } catch (error) {
            if (error.code !== 'storage/object-not-found') {
                throw error;
            }
            // File doesn't exist, proceed with upload
        }

        console.log(`Uploading ${fileName}...`);
        const snapshot = await uploadBytes(storageRef, fileBuffer);
        console.log(`✅ Uploaded ${fileName}!`);

        // Optional: Get URL immediately if needed
        // const url = await getDownloadURL(snapshot.ref);
        // return url;
    } catch (error) {
        console.error(`❌ Error uploading ${fileName}:`, error.message);
    }
}

async function main() {
    if (!fs.existsSync(LOCAL_SONGS_PATH)) {
        console.error(`Error: Directory not found at ${LOCAL_SONGS_PATH}`);
        return;
    }

    const files = fs.readdirSync(LOCAL_SONGS_PATH);
    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');

    console.log(`Found ${mp3Files.length} MP3 files.`);

    for (const file of mp3Files) {
        await uploadFile(path.join(LOCAL_SONGS_PATH, file), file);
    }

    console.log("All uploads complete!");
}

main();
