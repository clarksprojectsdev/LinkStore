import React from 'react';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import StorePage from '../../src/webstore/StorePage';

// Generate static params for static export
// Return empty array to make this a client-side route (stores are dynamic)
export async function generateStaticParams() {
  // #region agent log
  if (typeof process !== 'undefined' && process.env) {
    // Log during build time
    console.log('[generateStaticParams] Called during static export');
  }
  // #endregion
  
  // Return empty array - this makes the route client-side only
  // Since we don't know all store usernames at build time, we'll render on-demand
  return [];
}

// Expo Router route for /store/:username
// This satisfies static export requirements while using StorePage component
export default function StoreRoute() {
  const { username } = useLocalSearchParams();
  
  // Handle both string and array (Expo Router can return either)
  const storeUsername = typeof username === 'string' ? username : username?.[0] || '';
  
  if (!storeUsername) {
    return null;
  }
  
  return <StorePage username={storeUsername} />;
}
