import { Platform } from 'react-native';
import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { StoreProvider } from '../context/StoreContext';

// Expo Router layout - use Slot to render child routes
// Wrap with providers to ensure context is available
export default function RootLayout() {
  // Wrap with providers and use Slot to render child routes
  // This is required for static export and ensures context is available
  return (
    <AuthProvider>
      <StoreProvider>
        <Slot />
      </StoreProvider>
    </AuthProvider>
  );
}
