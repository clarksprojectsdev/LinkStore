import { Platform } from 'react-native';
import { Slot } from 'expo-router';
import React from 'react';

// Import the existing App for mobile
let MobileApp = null;
if (Platform.OS !== 'web') {
  try {
    // Dynamically import App.js to avoid circular dependencies
    MobileApp = require('../App').default;
  } catch (e) {
    console.warn('Could not load mobile App:', e);
  }
}

// Expo Router layout
// On mobile: renders existing App.js (React Navigation)
// On web: uses Expo Router file-based routing
export default function RootLayout() {
  // On mobile, render the existing App component
  if (Platform.OS !== 'web' && MobileApp) {
    return <MobileApp />;
  }

  // On web, use Expo Router for file-based routing
  return <Slot />;
}

