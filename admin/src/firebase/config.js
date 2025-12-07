/**
 * Configuration Firebase pour FAMILYS Backoffice
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAozXl0nSFgnDjCPNaczf3pyFaNIcQUzZY",
  authDomain: "family-2026.firebaseapp.com",
  projectId: "family-2026",
  storageBucket: "family-2026.firebasestorage.app",
  messagingSenderId: "430855066870",
  appId: "1:430855066870:web:67280cbebd6fb78db988d7",
  measurementId: "G-BH5JKR4M4G"
};

// Initialiser Firebase (éviter double initialisation)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Services Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;
