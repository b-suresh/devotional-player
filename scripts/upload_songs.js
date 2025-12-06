const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const fs = require("fs");
const path = require("path");

// --- CONFIGURATION ---
// 1. Get these from your Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyBJLaFLflEPCNadULCUDFBKSLHNoMmRkk4",
    authDomain: "thiruppugazh-storage.firebaseapp.com",
    projectId: "thiruppugazh-storage",
    storageBucket: "thiruppugazh-storage.firebasestorage.app",
    messagingSenderId: "470348799550",
    appId: "1:470348799550:web:8b2fb22e35de6c0b6bfb6f",
    measurementId: "G-1MXKJZT74X"
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
