import { Platform } from 'react-native';

// Index route - redirects to existing app on mobile, or shows message on web
export default function Index() {
  // On mobile, this route won't be used (App.js handles routing)
  // On web, redirect to a default page or show app info
  if (Platform.OS !== 'web') {
    return null;
  }

  // On web, you could redirect to a landing page or return null
  // The /store/[storeId] route will handle store pages
  return null;
}

