import { Platform, View, Text } from 'react-native';
import React from 'react';

// Index route - landing page for root path
export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#28a745' }}>LinkStore</Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>Visit a store by going to /store/[username]</Text>
    </View>
  );
}
