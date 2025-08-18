import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;
