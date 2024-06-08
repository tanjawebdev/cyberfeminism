// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzjwtQldRswb6aIkuEayaxdnemvOlDDGE",
    authDomain: "cyberfeminism.firebaseapp.com",
    projectId: "cyberfeminism",
    storageBucket: "cyberfeminism.appspot.com",
    messagingSenderId: "837718669527",
    appId: "1:837718669527:web:f17447289b91db7d2c5892"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };