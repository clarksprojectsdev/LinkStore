import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import StoreScreen from './screens/StoreScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import VendorSetupScreen from './screens/VendorSetupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import StoreWebView from './screens/StoreWebView';
import SellerDashboardScreen from './screens/SellerDashboardScreen';
import FirestoreTestScreen from './screens/FirestoreTestScreen';

// Screen names constants
const SCREEN_NAMES = {
  WELCOME: 'Welcome',
  STORE: 'Store',
  PRODUCT_DETAILS: 'ProductDetails',
  VENDOR_SETUP: 'VendorSetup',
  STORE_WEB_VIEW: 'StoreWebView',
  SELLER_DASHBOARD: 'SellerDashboard',
  FIRESTORE_TEST: 'FirestoreTest',
  LOGIN: 'Login',
  SIGN_UP: 'SignUp',
};

const Stack = createStackNavigator();

// Loading screen component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#28a745" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Web-only Store Page Component (lazy loaded with dynamic import)
const AppContent = () => {
  // #region agent log
  if (typeof window !== 'undefined' && Platform.OS === 'web') {
    fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:43',message:'AppContent component initialized',data:{platform:Platform.OS,userAgent:typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }
  // #endregion
  const { user, loading } = useAuth();
  const [webRoute, setWebRoute] = useState(null);
  const [StorePage, setStorePage] = useState(null);
  const [isLoadingStorePage, setIsLoadingStorePage] = useState(false);
  
  // Use refs to avoid stale closures in event handlers
  const storePageRef = useRef(null);
  const isLoadingRef = useRef(false);
  
  // Keep refs in sync with state
  useEffect(() => {
    storePageRef.current = StorePage;
  }, [StorePage]);
  
  useEffect(() => {
    isLoadingRef.current = isLoadingStorePage;
  }, [isLoadingStorePage]);

  // Handle web routing for /store/:username
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:63',message:'Web routing effect started',data:{pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Check route immediately on mount (handles page refresh)
      const checkRoute = () => {
        const pathname = window.location.pathname;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:67',message:'checkRoute called',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        const storeRouteMatch = pathname.match(/^\/store\/([^\/]+)$/);
        
        if (storeRouteMatch) {
          const username = decodeURIComponent(storeRouteMatch[1]); // Handle URL encoding
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:71',message:'Store route matched',data:{username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          setWebRoute({ type: 'store', username });
          
          // Lazy load StorePage component only when needed
          if (!storePageRef.current && !isLoadingRef.current) {
            setIsLoadingStorePage(true);
            import('./src/webstore/StorePage')
              .then((module) => {
                setStorePage(() => module.default);
                setIsLoadingStorePage(false);
              })
              .catch((err) => {
                console.error('Failed to load StorePage:', err);
                setIsLoadingStorePage(false);
              });
          }
        } else {
          setWebRoute(null);
          setStorePage(null); // Unload when not on store route
        }
      };

      // Check route immediately
      checkRoute();

      // Listen for browser navigation (back/forward buttons)
      const handlePopState = () => {
        checkRoute();
      };

      // Listen for programmatic navigation (pushState/replaceState)
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args);
        setTimeout(checkRoute, 0);
      };
      
      window.history.replaceState = function(...args) {
        originalReplaceState.apply(window.history, args);
        setTimeout(checkRoute, 0);
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
      };
    }
  }, []); // Empty deps - only run on mount, checkRoute uses refs for current values

  // Render web store page if on web and route matches
  if (Platform.OS === 'web' && webRoute?.type === 'store') {
    if (isLoadingStorePage) {
      return (
        <View style={styles.webContainer}>
          <StatusBar style="auto" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#28a745" />
            <Text style={styles.loadingText}>Loading store...</Text>
          </View>
        </View>
      );
    }
    
    if (StorePage) {
      return (
        <View style={styles.webContainer}>
          <StatusBar style="auto" />
          <StorePage username={webRoute.username} />
        </View>
      );
    }
  }

  // Mobile navigation (existing)
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      fallback={<LoadingScreen />}
    >
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={user ? SCREEN_NAMES.WELCOME : SCREEN_NAMES.LOGIN}
        screenOptions={styles.screenOptions}
      >
        {user ? (
          // Authenticated routes
          <>
            <Stack.Screen name={SCREEN_NAMES.WELCOME} component={WelcomeScreen} />
            <Stack.Screen name={SCREEN_NAMES.STORE} component={StoreScreen} />
            <Stack.Screen name={SCREEN_NAMES.PRODUCT_DETAILS} component={ProductDetailsScreen} />
            <Stack.Screen name={SCREEN_NAMES.VENDOR_SETUP} component={VendorSetupScreen} />
            <Stack.Screen name={SCREEN_NAMES.STORE_WEB_VIEW} component={StoreWebView} />
            <Stack.Screen name={SCREEN_NAMES.SELLER_DASHBOARD} component={SellerDashboardScreen} />
            <Stack.Screen name={SCREEN_NAMES.FIRESTORE_TEST} component={FirestoreTestScreen} />
          </>
        ) : (
          // Authentication routes
          <>
            <Stack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} />
            <Stack.Screen name={SCREEN_NAMES.SIGN_UP} component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  // #region agent log
  if (typeof window !== 'undefined' && Platform.OS === 'web') {
    fetch('http://127.0.0.1:7243/ingest/4ce12290-34aa-4238-9153-7a7624b2509d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:200',message:'App component mounted',data:{platform:Platform.OS,hasWindow:typeof window !== 'undefined',pathname:typeof window !== 'undefined' ? window.location.pathname : 'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'M'})}).catch(()=>{});
  }
  // #endregion
  
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  screenOptions: {
    headerShown: false,
    cardStyle: { backgroundColor: '#ffffff' },
  },
  webContainer: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
  },
});
