import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import StoreScreen from './screens/StoreScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import VendorSetupScreen from './screens/VendorSetupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import StoreWebView from './screens/StoreWebView';

const Stack = createStackNavigator();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      fallback={<Text>Loading...</Text>}
      onStateChange={(state) => {
        console.log('Navigation state changed:', state);
      }}
    >
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={user ? "Welcome" : "Login"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#ffffff' }
        }}
      >
        {user ? (
          // Authenticated routes
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Store" component={StoreScreen} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="VendorSetup" component={VendorSetupScreen} />
            <Stack.Screen name="StoreWebView" component={StoreWebView} />
          </>
        ) : (
          // Authentication routes
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
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
