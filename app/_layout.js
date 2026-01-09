import { Platform } from 'react-native';
import { Slot } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';

// Expo Router layout
// On mobile: renders existing App.js (React Navigation)
// On web: uses Expo Router file-based routing
export default function RootLayout() {
  const [MobileApp, setMobileApp] = useState(null);

  // Only load App.js on mobile platforms, using dynamic import
  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('../App')
        .then((module) => {
          setMobileApp(() => module.default);
        })
        .catch((e) => {
          console.warn('Could not load mobile App:', e);
        });
    }
  }, []);

  // On mobile, render the existing App component once loaded
  if (Platform.OS !== 'web' && MobileApp) {
    return <MobileApp />;
  }

  // On web, use Expo Router with Stack for proper routing
  if (Platform.OS === 'web') {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="store/[storeId]" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // On mobile, show loading while App.js is being loaded
  return null;
}

