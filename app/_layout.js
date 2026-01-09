import { Platform } from 'react-native';
import { Slot } from 'expo-router';
import React from 'react';

// Expo Router layout - use Slot to render child routes
// This allows htmlRoutes to be generated properly for static export
export default function RootLayout() {
  // #region agent log
  if (typeof window !== 'undefined' && Platform.OS === 'web') {
    fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/_layout.js:10',message:'RootLayout rendered',data:{platform:Platform.OS,pathname:typeof window !== 'undefined' ? window.location.pathname : 'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'H'})}).catch(()=>{});
  }
  // #endregion
  
  // Use Slot to render child routes - this is required for static export
  return <Slot />;
}
