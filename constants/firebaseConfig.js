import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAozXl0nSFgnDjCPNaczf3pyFaNIcQUzZY",
  authDomain: "family-2026.firebaseapp.com",
  projectId: "family-2026",
  storageBucket: "family-2026.firebasestorage.app",
  messagingSenderId: "430855066870",
  appId: "1:430855066870:web:67280cbebd6fb78db988d7"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;
