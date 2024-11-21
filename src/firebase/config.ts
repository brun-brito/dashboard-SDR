import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDBU13kBAnJocLxDdJ5guUjj0Q5wXcp-N8",
    authDomain: "sdr-injectbox.firebaseapp.com",
    projectId: "sdr-injectbox",
    storageBucket: "sdr-injectbox.firebasestorage.app",
    messagingSenderId: "239044375947",
    appId: "1:239044375947:web:04c4903d774869d7352b8e",
    measurementId: "G-FJQE99PY2Y"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);