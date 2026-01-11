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

// Screen names constants
const SCREEN_NAMES = {
  WELCOME: 'Welcome',
  STORE: 'Store',
  PRODUCT_DETAILS: 'ProductDetails',
  VENDOR_SETUP: 'VendorSetup',
  STORE_WEB_VIEW: 'StoreWebView',
  SELLER_DASHBOARD: 'SellerDashboard',
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
  const { user, loading } = useAuth();
  const [webRoute, setWebRoute] = useState(null);
  const [StorePage, setStorePage] = useState(null);
  const [isLoadingStorePage, setIsLoadingStorePage] = useState(false);
  const [routeChecked, setRouteChecked] = useState(false);
  
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

  // Handle web routing for /store/:username and root path
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check route immediately on mount (handles page refresh)
      const checkRoute = () => {
        const pathname = window.location.pathname;
        const storeRouteMatch = pathname.match(/^\/store\/([^\/]+)$/);
        
        if (storeRouteMatch) {
          const username = decodeURIComponent(storeRouteMatch[1]); // Handle URL encoding
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
        } else if (pathname === '/' || pathname === '') {
          // Root path - show landing page
          setWebRoute({ type: 'landing' });
        } else {
          // Unknown route - set to null (will show 404 after routeChecked)
          setWebRoute(null);
          setStorePage(null); // Unload when not on store route
        }
        
        // Mark route check as complete
        setRouteChecked(true);
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

  // Render web pages if on web - early return to prevent fallthrough
  if (Platform.OS === 'web') {
    // Show loading state while route is being checked
    if (!routeChecked) {
      return (
        <View style={styles.webContainer}>
          <StatusBar style="auto" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#28a745" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      );
    }
    
    // Landing page for root path
    if (webRoute?.type === 'landing') {
      return (
        <View style={styles.webContainer}>
          <StatusBar style="auto" />
          <View style={styles.landingContainer}>
            <Text style={styles.landingTitle}>LinkStore</Text>
            <Text style={styles.landingSubtitle}>Visit a store by going to /store/[username]</Text>
          </View>
        </View>
      );
    }
    
    // Store page
    if (webRoute?.type === 'store') {
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
    
    // 404 - Unknown route (routeChecked is true but webRoute is null)
    return (
      <View style={styles.webContainer}>
        <StatusBar style="auto" />
        <View style={styles.landingContainer}>
          <Text style={styles.landingTitle}>404</Text>
          <Text style={styles.landingSubtitle}>Page not found</Text>
        </View>
      </View>
    );
  }

  // Mobile navigation (existing) - web never reaches here
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
  landingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  landingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#28a745',
  },
  landingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
