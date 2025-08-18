import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [storeData, setStoreData] = useState({
    storeName: 'My Store',
    whatsappNumber: '',
    bannerImage: null,
  });
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadStoreData();
  }, []);

           const loadStoreData = async () => {
           try {
             // Load store data from secure storage
             const storedStoreData = await SecureStore.getItemAsync('storeData');
             const storedProducts = await SecureStore.getItemAsync('products');
             
             if (storedStoreData) {
               setStoreData(JSON.parse(storedStoreData));
             }
             
             if (storedProducts) {
               setProducts(JSON.parse(storedProducts));
             }
           } catch (error) {
             console.error('Error loading store data:', error);
             // Fallback to AsyncStorage if secure storage fails
             try {
               const fallbackStoreData = await AsyncStorage.getItem('storeData');
               const fallbackProducts = await AsyncStorage.getItem('products');
               
               if (fallbackStoreData) {
                 setStoreData(JSON.parse(fallbackStoreData));
               }
               
               if (fallbackProducts) {
                 setProducts(JSON.parse(fallbackProducts));
               }
             } catch (fallbackError) {
               console.error('Fallback storage also failed:', fallbackError);
             }
           } finally {
             setIsLoading(false);
           }
         };

           const saveStoreData = async (newStoreData) => {
           try {
             const updatedData = { ...storeData, ...newStoreData };
             setStoreData(updatedData);
             // Save to secure storage
             await SecureStore.setItemAsync('storeData', JSON.stringify(updatedData));
             // Also save to AsyncStorage as backup
             await AsyncStorage.setItem('storeData', JSON.stringify(updatedData));
           } catch (error) {
             console.error('Error saving store data:', error);
             // Fallback to AsyncStorage only
             try {
               await AsyncStorage.setItem('storeData', JSON.stringify(updatedData));
             } catch (fallbackError) {
               console.error('Fallback storage also failed:', fallbackError);
             }
           }
         };

  const addProduct = async (product) => {
    try {
      const newProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        category: product.category || 'General',
        rating: product.rating || 0,
        ratingCount: product.ratingCount || 0,
        storeId: storeData.storeName?.toLowerCase().replace(/\s+/g, '-') || 'my-store',
      };
      
                   const updatedProducts = [...products, newProduct];
             setProducts(updatedProducts);
             // Save to secure storage
             await SecureStore.setItemAsync('products', JSON.stringify(updatedProducts));
             // Also save to AsyncStorage as backup
             await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
             return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
                   const updatedProducts = products.map(product =>
               product.id === productId ? { ...product, ...updatedData } : product
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
             await AsyncStorage.multiRemove(['storeData', 'products']);
             
             setStoreData({
               storeName: 'My Store',
               whatsappNumber: '',
               bannerImage: null,
             });
             setProducts([]);
           } catch (error) {
             console.error('Error clearing data:', error);
             // Fallback to AsyncStorage only
             try {
               await AsyncStorage.multiRemove(['storeData', 'products']);
             } catch (fallbackError) {
               console.error('Fallback clear also failed:', fallbackError);
             }
           }
         };

  const value = {
    storeData,
    products,
    isLoading,
    saveStoreData,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAllData,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
