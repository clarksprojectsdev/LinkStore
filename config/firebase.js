import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform check for web vs mobile
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

// Your Firebase configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyA_yVwPCqv_wdEPVUpyKE8Ukfxs0-MqR5M",
  authDomain: "linkstore-65562.firebaseapp.com",
  projectId: "linkstore-65562",
  storageBucket: "linkstore-65562.firebasestorage.app",
  messagingSenderId: "931780070559",
  appId: "1:931780070559:web:4119ac1025a8acd8dae6aa",
  measurementId: "G-CBGT6PW48X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with platform-specific persistence
// On web, use browser persistence (automatic)
// On mobile, use AsyncStorage persistence
export const auth = isWeb
  ? getAuth(app)  // Web: uses browser localStorage automatically
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });  // Mobile: uses AsyncStorage

// Initialize Firestore with offline persistence enabled
// Firestore automatically enables offline persistence on React Native
// For web, we explicitly enable it
let db;
if (isWeb) {
  db = getFirestore(app);
  // Enable offline persistence for web
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firestore persistence already enabled in another tab');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required
      console.warn('Firestore persistence is not supported in this browser');
    }
  });
} else {
  // For React Native, Firestore automatically enables offline persistence
  // We can use getFirestore which will handle it automatically
  db = getFirestore(app);
}

// Export Firestore instance
export { db };

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
