import { Platform, View, Text } from 'react-native';
import React from 'react';

// Index route - landing page for root path
export default function Index() {
  // #region agent log
  if (typeof window !== 'undefined' && Platform.OS === 'web') {
    fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.js:8',message:'Index route rendered',data:{platform:Platform.OS},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'I'})}).catch(()=>{});
  }
  // #endregion
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#28a745' }}>LinkStore</Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>Visit a store by going to /store/[username]</Text>
    </View>
  );
}
