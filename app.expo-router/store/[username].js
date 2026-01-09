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
  
  // #region agent log
  if (typeof window !== 'undefined' && Platform.OS === 'web') {
    fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/store/[username].js:28',message:'StoreRoute component rendered',data:{username:typeof username === 'string' ? username : username?.[0] || 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'L'})}).catch(()=>{});
  }
  // #endregion
  
  // Handle both string and array (Expo Router can return either)
  const storeUsername = typeof username === 'string' ? username : username?.[0] || '';
  
  if (!storeUsername) {
    return null;
  }
  
  return <StorePage username={storeUsername} />;
}
