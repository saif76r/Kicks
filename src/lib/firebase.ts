import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCdv8Kd_ciOGpbuMtbyzo55rQpcG-7BS6A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kicks-8867d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kicks-8867d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kicks-8867d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "258892472715",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:258892472715:web:8fe3594d556d34f9350f8e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5Q31SWNSCZ"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
