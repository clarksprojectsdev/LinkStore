import { Platform } from 'react-native';
import { Redirect } from 'expo-router';

// Minimal index route to satisfy Expo Router
export default function Index() {
  // On web, redirect to App.js handling
  if (Platform.OS === 'web') {
    return null; // App.js will handle this
  }
  
  return null;
}
