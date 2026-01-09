import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import {
  getStoreByUserId,
  getProductsByStoreId,
  saveStoreToFirestore,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
} from '../utils/firestoreHelpers';
import {
  uploadStoreBanner,
  uploadStoreLogo,
  uploadProductImage,
  uploadProductVideo,
  isLocalFile,
} from '../utils/storageHelpers';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();
  const [storeData, setStoreData] = useState({
    storeName: 'My Store',
    whatsappNumber: '',
    bannerImage: null,
    logo: null,
    description: null,
    username: null,
    storeRating: 0,
    storeRatingCount: 0,
  });
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalClicks: 0,
    totalOrders: 0,
    conversionRate: 0,
    lastUpdated: new Date().toISOString(),
  });

  // Load data from Firestore and local storage on app start
  useEffect(() => {
    loadStoreData();
  }, [user]);

  // Sync products from Firestore when user changes
  useEffect(() => {
    if (user?.uid) {
      loadProductsFromFirestore();
    }
  }, [user?.uid]);

  // Update analytics when products change
  useEffect(() => {
    updateAnalytics();
  }, [products]);

  const loadStoreData = async () => {
    try {
      setIsLoading(true);
      
      let storeDataLoaded = false;
      
      // Try to load from Firestore first (source of truth)
      if (user?.uid) {
        try {
          const firestoreStore = await getStoreByUserId(user.uid);
          if (firestoreStore) {
            // Convert Firestore timestamps to ISO strings for local storage compatibility
            const storeDataForState = {
              storeName: firestoreStore.storeName || 'My Store',
              whatsappNumber: firestoreStore.whatsappNumber || '',
              bannerImage: firestoreStore.bannerImage || null,
              logo: firestoreStore.logo || null,
              description: firestoreStore.description || null,
              username: firestoreStore.username || null,
              storeRating: firestoreStore.storeRating || 0,
              storeRatingCount: firestoreStore.storeRatingCount || 0,
            };
            setStoreData(storeDataForState);
            storeDataLoaded = true;
            
            // Also save to local storage for offline access
            await SecureStore.setItemAsync('storeData', JSON.stringify(storeDataForState));
            await AsyncStorage.setItem('storeData', JSON.stringify(storeDataForState));
          }
        } catch (firestoreError) {
          console.warn('Error loading from Firestore, falling back to local storage:', firestoreError);
        }
      }
      
      // Fallback to local storage if Firestore didn't return data or user not logged in
      if (!storeDataLoaded) {
        try {
          const storedStoreData = await SecureStore.getItemAsync('storeData');
          const storedAnalytics = await SecureStore.getItemAsync('analytics');
          
          if (storedStoreData) {
            // Use local storage as fallback even if user is logged in (in case Firestore doc doesn't exist yet)
            setStoreData(JSON.parse(storedStoreData));
            storeDataLoaded = true;
          }
          
          if (storedAnalytics) {
            setAnalytics(JSON.parse(storedAnalytics));
          }
        } catch (error) {
          // Fallback to AsyncStorage if secure storage fails
          try {
            const fallbackStoreData = await AsyncStorage.getItem('storeData');
            const fallbackAnalytics = await AsyncStorage.getItem('analytics');
            
            if (fallbackStoreData) {
              setStoreData(JSON.parse(fallbackStoreData));
              storeDataLoaded = true;
            }
            
            if (fallbackAnalytics) {
              setAnalytics(JSON.parse(fallbackAnalytics));
            }
          } catch (fallbackError) {
            // Silent fallback
          }
        }
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsFromFirestore = async () => {
    try {
      if (!user?.uid) return;
      
      const firestoreProducts = await getProductsByStoreId(user.uid);
      
      if (firestoreProducts && firestoreProducts.length > 0) {
        // Convert Firestore timestamps to ISO strings for compatibility
        const productsForState = firestoreProducts.map(product => ({
          ...product,
          createdAt: product.createdAt?.toDate?.()?.toISOString() || product.createdAt || new Date().toISOString(),
        }));
        
        setProducts(productsForState);
        
        // Also save to local storage for offline access
        await SecureStore.setItemAsync('products', JSON.stringify(productsForState));
        await AsyncStorage.setItem('products', JSON.stringify(productsForState));
      }
    } catch (error) {
      console.warn('Error loading products from Firestore, falling back to local storage:', error);
      
      // Fallback to local storage
      try {
        const storedProducts = await SecureStore.getItemAsync('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } catch (localError) {
        try {
          const fallbackProducts = await AsyncStorage.getItem('products');
          if (fallbackProducts) {
            setProducts(JSON.parse(fallbackProducts));
          }
        } catch (fallbackError) {
          // Silent fallback
        }
      }
    }
  };

  const saveStoreData = async (newStoreData) => {
    try {
      let processedData = { ...storeData, ...newStoreData };
      
      // Upload images to Firebase Storage if they are local files
      if (user?.uid) {
        try {
          // Upload banner image if it's a local file
          if (processedData.bannerImage && isLocalFile(processedData.bannerImage)) {
            try {
              processedData.bannerImage = await uploadStoreBanner(user.uid, processedData.bannerImage);
            } catch (uploadError) {
              // If upload fails (offline), keep local path for now
              console.warn('Banner upload failed, keeping local path:', uploadError);
            }
          }
          
          // Upload logo if it's a local file
          if (processedData.logo && isLocalFile(processedData.logo)) {
            try {
              processedData.logo = await uploadStoreLogo(user.uid, processedData.logo);
            } catch (uploadError) {
              // If upload fails (offline), keep local path for now
              console.warn('Logo upload failed, keeping local path:', uploadError);
            }
          }
        } catch (uploadError) {
          // Continue even if uploads fail (offline scenario)
          console.warn('Image uploads failed, continuing with local paths:', uploadError);
        }
      }
      
      setStoreData(processedData);
      
      // Save to Firestore (source of truth)
      if (user?.uid) {
        try {
          await saveStoreToFirestore(user.uid, processedData);
        } catch (firestoreError) {
          // Only log non-offline errors
          if (firestoreError.code !== 'unavailable' && 
              !firestoreError.message?.includes('offline') &&
              !firestoreError.message?.includes('Failed to get document')) {
          console.error('Error saving to Firestore:', firestoreError);
          }
          // Continue to save locally even if Firestore fails
        }
      }
      
      // Save to secure storage for offline access
      await SecureStore.setItemAsync('storeData', JSON.stringify(processedData));
      // Also save to AsyncStorage as backup
      await AsyncStorage.setItem('storeData', JSON.stringify(processedData));
    } catch (error) {
      console.error('Error saving store data:', error);
      // Fallback to AsyncStorage only
      try {
        const updatedData = { ...storeData, ...newStoreData };
        await AsyncStorage.setItem('storeData', JSON.stringify(updatedData));
      } catch (fallbackError) {
        // Silent fallback
      }
    }
  };

  const addProduct = async (product) => {
    try {
      if (!user?.uid) {
        throw new Error('User must be logged in to add products');
      }
      
      let productData = {
        title: product.title,
        price: product.price,
        description: product.description || '',
        category: product.category || 'General',
        image: product.image,
        previewVideo: product.previewVideo || null,
        rating: product.rating || 0,
        ratingCount: product.ratingCount || 0,
      };
      
      // Upload images to Firebase Storage if they are local files
      try {
        // Upload product image if it's a local file
        if (productData.image && isLocalFile(productData.image)) {
          try {
            // We'll upload with a temp ID first, then update after getting the real product ID
            productData.image = await uploadProductImage(user.uid, null, productData.image);
          } catch (uploadError) {
            // If upload fails (offline), keep local path for now
            console.warn('Product image upload failed, keeping local path:', uploadError);
          }
        }
        
        // Upload product video if it's a local file
        if (productData.previewVideo && isLocalFile(productData.previewVideo)) {
          try {
            productData.previewVideo = await uploadProductVideo(user.uid, null, productData.previewVideo);
          } catch (uploadError) {
            // If upload fails (offline), keep local path for now
            console.warn('Product video upload failed, keeping local path:', uploadError);
          }
        }
      } catch (uploadError) {
        // Continue even if uploads fail (offline scenario)
        console.warn('Image/video uploads failed, continuing with local paths:', uploadError);
      }
      
      // Save to Firestore (source of truth)
      let firestoreProduct;
      try {
        firestoreProduct = await addProductToFirestore(user.uid, productData);
        
        // If we uploaded with a temp ID, we might need to re-upload with the real product ID
        // But for now, Firebase Storage paths are flexible enough
        
        // Convert Firestore timestamp to ISO string for local storage
        const productForState = {
          ...firestoreProduct,
          id: firestoreProduct.id,
          createdAt: firestoreProduct.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
        
        const updatedProducts = [...products, productForState];
        setProducts(updatedProducts);
        
        // Save to secure storage for offline access
        await SecureStore.setItemAsync('products', JSON.stringify(updatedProducts));
        // Also save to AsyncStorage as backup
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        
        return productForState;
      } catch (firestoreError) {
        console.error('Error adding product to Firestore:', firestoreError);
        // Fallback: save locally only if Firestore fails
        const fallbackProduct = {
          ...productData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          storeId: user.uid,
        };
        
        const updatedProducts = [...products, fallbackProduct];
        setProducts(updatedProducts);
        await SecureStore.setItemAsync('products', JSON.stringify(updatedProducts));
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
        
        return fallbackProduct;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      if (!user?.uid) {
        throw new Error('User must be logged in to update products');
      }
      
      let processedData = { ...updatedData };
      
      // Upload images to Firebase Storage if they are local files
      try {
        // Upload product image if it's a local file
        if (processedData.image && isLocalFile(processedData.image)) {
          try {
            processedData.image = await uploadProductImage(user.uid, productId, processedData.image);
          } catch (uploadError) {
            // If upload fails (offline), keep local path for now
            console.warn('Product image upload failed, keeping local path:', uploadError);
          }
        }
        
        // Upload product video if it's a local file
        if (processedData.previewVideo && isLocalFile(processedData.previewVideo)) {
          try {
            processedData.previewVideo = await uploadProductVideo(user.uid, productId, processedData.previewVideo);
          } catch (uploadError) {
            // If upload fails (offline), keep local path for now
            console.warn('Product video upload failed, keeping local path:', uploadError);
          }
        }
      } catch (uploadError) {
        // Continue even if uploads fail (offline scenario)
        console.warn('Image/video uploads failed, continuing with local paths:', uploadError);
      }
      
      // Update in Firestore (source of truth)
      try {
        await updateProductInFirestore(productId, processedData);
      } catch (firestoreError) {
        console.error('Error updating product in Firestore:', firestoreError);
        // Continue to update locally even if Firestore fails
      }
      
      // Update local state
      const updatedProducts = products.map(product =>
        product.id === productId ? { ...product, ...processedData } : product
      );
      
      setProducts(updatedProducts);
      // Save to secure storage
      await SecureStore.setItemAsync('products', JSON.stringify(updatedProducts));
      // Also save to AsyncStorage as backup
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      if (!user?.uid) {
        throw new Error('User must be logged in to delete products');
      }
      
      // Delete from Firestore (source of truth)
      try {
        await deleteProductFromFirestore(productId);
      } catch (firestoreError) {
        console.error('Error deleting product from Firestore:', firestoreError);
        // Continue to delete locally even if Firestore fails
      }
      
      // Update local state
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      // Save to secure storage
      await SecureStore.setItemAsync('products', JSON.stringify(updatedProducts));
      // Also save to AsyncStorage as backup
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const clearAllData = async () => {
    try {
      // Clear from both secure storage and AsyncStorage
      await SecureStore.deleteItemAsync('storeData');
      await SecureStore.deleteItemAsync('products');
      await SecureStore.deleteItemAsync('analytics');
      await AsyncStorage.multiRemove(['storeData', 'products', 'analytics']);
      
      setStoreData({
        storeName: 'My Store',
        whatsappNumber: '',
        bannerImage: null,
        logo: null,
        description: null,
        username: null,
        storeRating: 0,
        storeRatingCount: 0,
      });
      setProducts([]);
      setAnalytics({
        totalProducts: 0,
        totalClicks: 0,
        totalOrders: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      // Fallback to AsyncStorage only
      try {
        await AsyncStorage.multiRemove(['storeData', 'products', 'analytics']);
      } catch (fallbackError) {
        console.error('Fallback clear also failed:', fallbackError);
      }
    }
  };

  // Analytics functions
  const updateAnalytics = async () => {
    try {
      const newAnalytics = {
        totalProducts: products.length,
        totalClicks: analytics.totalClicks,
        totalOrders: analytics.totalOrders,
        conversionRate: analytics.totalClicks > 0 ? 
          Math.round((analytics.totalOrders / analytics.totalClicks) * 100 * 10) / 10 : 0,
        lastUpdated: new Date().toISOString(),
      };
      
      setAnalytics(newAnalytics);
      
      // Save to secure storage
      await SecureStore.setItemAsync('analytics', JSON.stringify(newAnalytics));
      // Also save to AsyncStorage as backup
      await AsyncStorage.setItem('analytics', JSON.stringify(newAnalytics));
    } catch (error) {
      console.error('Error updating analytics:', error);
      // Fallback to AsyncStorage only
      try {
        await AsyncStorage.setItem('analytics', JSON.stringify(newAnalytics));
      } catch (fallbackError) {
        console.error('Fallback analytics save also failed:', fallbackError);
      }
    }
  };

  const incrementClicks = async () => {
    try {
      const newAnalytics = {
        ...analytics,
        totalClicks: analytics.totalClicks + 1,
        conversionRate: analytics.totalClicks + 1 > 0 ? 
          Math.round((analytics.totalOrders / (analytics.totalClicks + 1)) * 100 * 10) / 10 : 0,
        lastUpdated: new Date().toISOString(),
      };
      
      setAnalytics(newAnalytics);
      
      // Save to secure storage
      await SecureStore.setItemAsync('analytics', JSON.stringify(newAnalytics));
      // Also save to AsyncStorage as backup
      await AsyncStorage.setItem('analytics', JSON.stringify(newAnalytics));
    } catch (error) {
      console.error('Error incrementing clicks:', error);
    }
  };

  const incrementOrders = async () => {
    try {
      const newAnalytics = {
        ...analytics,
        totalOrders: analytics.totalOrders + 1,
        conversionRate: analytics.totalClicks > 0 ? 
          Math.round(((analytics.totalOrders + 1) / analytics.totalClicks) * 100 * 10) / 10 : 0,
        lastUpdated: new Date().toISOString(),
      };
      
      setAnalytics(newAnalytics);
      
      // Save to secure storage
      await SecureStore.setItemAsync('analytics', JSON.stringify(newAnalytics));
      // Also save to AsyncStorage as backup
      await AsyncStorage.setItem('analytics', JSON.stringify(newAnalytics));
    } catch (error) {
      console.error('Error incrementing orders:', error);
    }
  };

  const refreshAnalytics = async () => {
    await updateAnalytics();
  };

  const updateStoreRating = async (rating) => {
    try {
      if (!user?.uid) {
        throw new Error('User must be logged in to update store rating');
      }
      
      const newRatingCount = storeData.storeRatingCount + 1;
      const newAverageRating = ((storeData.storeRating * storeData.storeRatingCount) + rating) / newRatingCount;
      
      const updatedStoreData = {
        ...storeData,
        storeRating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
        storeRatingCount: newRatingCount,
      };
      
      setStoreData(updatedStoreData);
      
      // Save to Firestore (source of truth)
      try {
        await saveStoreToFirestore(user.uid, updatedStoreData);
      } catch (firestoreError) {
        console.error('Error updating store rating in Firestore:', firestoreError);
        // Continue to save locally even if Firestore fails
      }
      
      // Save to secure storage
      await SecureStore.setItemAsync('storeData', JSON.stringify(updatedStoreData));
      // Also save to AsyncStorage as backup
      await AsyncStorage.setItem('storeData', JSON.stringify(updatedStoreData));
      
      return updatedStoreData;
    } catch (error) {
      console.error('Error updating store rating:', error);
      throw error;
    }
  };


  const value = {
    storeData,
    products,
    isLoading,
    analytics,
    saveStoreData,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAllData,
    incrementClicks,
    incrementOrders,
    refreshAnalytics,
    updateStoreRating,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
