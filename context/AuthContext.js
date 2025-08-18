import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user data on app start
    checkStoredUser();
    
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Vendor',
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
                       // Store user data in secure storage
               await SecureStore.setItemAsync('user', JSON.stringify(userData));
               // Also store in AsyncStorage as backup
               await AsyncStorage.setItem('user', JSON.stringify(userData));
               } else {
           // User is signed out
           setUser(null);
           setIsAuthenticated(false);
           // Clear from both secure storage and AsyncStorage
           await SecureStore.deleteItemAsync('user');
           await AsyncStorage.removeItem('user');
         }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

           const checkStoredUser = async () => {
           try {
             // Check secure storage first
             const storedUser = await SecureStore.getItemAsync('user');
             if (storedUser) {
               const userData = JSON.parse(storedUser);
               setUser(userData);
               setIsAuthenticated(true);
               return;
             }
             
             // Fallback to AsyncStorage
             const fallbackUser = await AsyncStorage.getItem('user');
             if (fallbackUser) {
               const userData = JSON.parse(fallbackUser);
               setUser(userData);
               setIsAuthenticated(true);
             }
           } catch (error) {
             console.error('Error checking stored user:', error);
             // Try AsyncStorage as last resort
             try {
               const fallbackUser = await AsyncStorage.getItem('user');
               if (fallbackUser) {
                 const userData = JSON.parse(fallbackUser);
                 setUser(userData);
                 setIsAuthenticated(true);
               }
             } catch (fallbackError) {
               console.error('Fallback user check also failed:', fallbackError);
             }
           }
         };

           const signUp = async (email, password, displayName = 'Vendor') => {
           try {
             setLoading(true);
             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
             
             // Update profile with display name
             await updateProfile(userCredential.user, {
               displayName: displayName
             });

             const userData = {
               uid: userCredential.user.uid,
               email: userCredential.user.email,
               displayName: displayName,
             };

             setUser(userData);
             setIsAuthenticated(true);
             // Store user data in secure storage
             await SecureStore.setItemAsync('user', JSON.stringify(userData));
             // Also store in AsyncStorage as backup
             await AsyncStorage.setItem('user', JSON.stringify(userData));
             
             return { success: true, user: userData };
           } catch (error) {
             // Don't log the raw error to console - let the UI handle it
             return { 
               success: false, 
               error: error.code || error.message 
             };
           } finally {
             setLoading(false);
           }
         };

           const signIn = async (email, password) => {
           try {
             setLoading(true);
             const userCredential = await signInWithEmailAndPassword(auth, email, password);
             
             const userData = {
               uid: userCredential.user.uid,
               email: userCredential.user.email,
               displayName: userCredential.user.displayName || 'Vendor',
             };

             setUser(userData);
             setIsAuthenticated(true);
             // Store user data in secure storage
             await SecureStore.setItemAsync('user', JSON.stringify(userData));
             // Also store in AsyncStorage as backup
             await AsyncStorage.setItem('user', JSON.stringify(userData));
             
             return { success: true, user: userData };
           } catch (error) {
             // Don't log the raw error to console - let the UI handle it
             return { 
               success: false, 
               error: error.code || error.message 
             };
           } finally {
             setLoading(false);
           }
         };

  const logOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      // Clear from both secure storage and AsyncStorage
      await SecureStore.deleteItemAsync('user');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to AsyncStorage only
      try {
        await AsyncStorage.removeItem('user');
      } catch (fallbackError) {
        console.error('Fallback logout clear also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
