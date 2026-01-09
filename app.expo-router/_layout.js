import { Platform } from 'react-native';
import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { StoreProvider } from '../context/StoreContext';

// Expo Router layout - use Slot to render child routes
// Wrap with providers to ensure context is available
export default function RootLayout() {
  // #region agent log
  if (typeof window !== 'undefined' && Platform.OS === 'web') {
    fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/_layout.js:11',message:'RootLayout rendered',data:{platform:Platform.OS,pathname:typeof window !== 'undefined' ? window.location.pathname : 'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'K'})}).catch(()=>{});
  }
  // #endregion
  
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
