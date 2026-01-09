import { Stack } from 'expo-router';

// Expo Router layout for web static export
// For mobile, App.js handles routing via React Navigation
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="store/[storeId]" />
    </Stack>
  );
}

