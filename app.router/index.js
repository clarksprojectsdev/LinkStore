import { Platform, View, Text } from 'react-native';

// Index route - redirects to existing app on mobile, or shows message on web
export default function Index() {
  // On mobile, this route won't be used (App.js handles routing)
  if (Platform.OS !== 'web') {
    return null;
  }

  // On web, show a simple landing page
  // Users should navigate to /store/[username] to view stores
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#28a745' }}>LinkStore</Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>Visit a store by going to /store/[username]</Text>
    </View>
  );
}