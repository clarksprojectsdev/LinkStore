import { Platform } from 'react-native';
import { Slot } from 'expo-router';
import React from 'react';

// Minimal Expo Router layout to satisfy EAS Hosting
// On web, we'll use App.js routing instead
export default function RootLayout() {
  // On web, return null - App.js will handle routing
  if (Platform.OS === 'web') {
    return null;
  }
  
  // On mobile, use Slot (though App.js handles mobile routing too)
  return <Slot />;
}
