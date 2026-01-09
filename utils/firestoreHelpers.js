import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Generate a URL-safe slug from a store name
 * @param {string} storeName - The store name to slugify
 * @returns {string} - A URL-safe slug
 */
export const generateUsernameSlug = (storeName) => {
  if (!storeName) return null;
  
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Check if a username slug is available
 * @param {string} username - The username to check
 * @param {string} excludeUserId - User ID to exclude from check (for updates)
 * @returns {Promise<boolean>} - True if available, false if taken
 */
export const isUsernameAvailable = async (username, excludeUserId = null) => {
  try {
    if (!username) return false;
    
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return true;
    
    // If checking for update, allow if it's the same user's store
    if (excludeUserId) {
      const existingStore = querySnapshot.docs[0];
      if (existingStore.id === excludeUserId) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

/**
 * Generate a unique username slug, appending numbers if needed
 * @param {string} storeName - The store name to create slug from
 * @param {string} excludeUserId - User ID to exclude from uniqueness check
 * @returns {Promise<string>} - A unique username slug
 */
export const generateUniqueUsername = async (storeName, excludeUserId = null) => {
  const baseSlug = generateUsernameSlug(storeName);
  if (!baseSlug) return null;
  
  let username = baseSlug;
  let counter = 1;
  
  while (!(await isUsernameAvailable(username, excludeUserId))) {
    username = `${baseSlug}-${counter}`;
    counter++;
    
    // Safety limit to prevent infinite loops
    if (counter > 1000) {
      // Fallback to timestamp-based slug
      username = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return username;
};

/**
 * Get store document by username
 * @param {string} username - The username slug
 * @returns {Promise<Object|null>} - Store document data or null if not found
 */
export const getStoreByUsername = async (username) => {
  try {
    if (!username) return null;
    
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const storeDoc = querySnapshot.docs[0];
    return {
      id: storeDoc.id,
      ...storeDoc.data(),
    };
  } catch (error) {
    console.error('Error getting store by username:', error);
    return null;
  }
};

/**
 * Get store document by user ID
 * @param {string} userId - The user ID (Firebase Auth UID)
 * @returns {Promise<Object|null>} - Store document data or null if not found
 */
export const getStoreByUserId = async (userId) => {
  try {
    if (!userId) return null;
    
    const storeDocRef = doc(db, 'stores', userId);
    // getDoc will automatically use cache when offline
    const storeDoc = await getDoc(storeDocRef);
    
    if (!storeDoc.exists()) return null;
    
    return {
      id: storeDoc.id,
      ...storeDoc.data(),
    };
  } catch (error) {
    // Only log non-offline errors as errors
    // Offline errors are expected and handled gracefully by falling back to local storage
    if (error.code === 'unavailable' || 
        error.code === 'failed-precondition' ||
        error.message?.includes('offline') ||
        error.message?.includes('client is offline')) {
      // Silently handle offline errors - they're expected and handled by StoreContext fallback
      return null;
    }
    console.error('Error getting store by user ID:', error);
    return null;
  }
};

/**
 * Get all products for a store by store ID
 * @param {string} storeId - The store ID (user.uid)
 * @returns {Promise<Array>} - Array of product documents
 */
export const getProductsByStoreId = async (storeId) => {
  try {
    if (!storeId) return [];
    
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('storeId', '==', storeId));
    const querySnapshot = await getDocs(q);
    
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    // Sort by creation date (newest first)
    products.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const dateB = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return dateB - dateA;
    });
    
    return products;
  } catch (error) {
    console.error('Error getting products by store ID:', error);
    return [];
  }
};

/**
 * Create or update a store document in Firestore
 * @param {string} userId - The user ID (Firebase Auth UID)
 * @param {Object} storeData - Store data to save
 * @returns {Promise<Object>} - Updated store document
 */
export const saveStoreToFirestore = async (userId, storeData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const storeDocRef = doc(db, 'stores', userId);
    
    // Try to get existing store, but handle offline gracefully
    let existingStore = null;
    try {
      existingStore = await getDoc(storeDocRef);
    } catch (getDocError) {
      // If offline, we'll proceed without checking existing store
      // Firestore will queue the write when back online
      if (getDocError.code === 'unavailable' || 
          getDocError.message?.includes('offline') ||
          getDocError.message?.includes('Failed to get document')) {
        console.warn('Firestore offline - will queue write when online');
        // Continue without existing store data
      } else {
        throw getDocError;
      }
    }
    
    let username = storeData.username;
    
    // Generate username for NEW stores (when store doesn't exist yet)
    if (!existingStore?.exists() && storeData.storeName && !username) {
      try {
        username = await generateUniqueUsername(storeData.storeName, userId);
      } catch (usernameError) {
        // If offline, skip username generation
        if (usernameError.code === 'unavailable' || 
            usernameError.message?.includes('offline')) {
          console.warn('Skipping username generation - offline');
        } else {
          throw usernameError;
        }
      }
    }
    
    // Generate username for EXISTING stores if storeName is provided and username doesn't exist
    if (existingStore?.exists() && storeData.storeName && !username) {
      try {
        username = await generateUniqueUsername(storeData.storeName, userId);
      } catch (usernameError) {
        // If offline, skip username generation
        if (usernameError.code === 'unavailable' || 
            usernameError.message?.includes('offline')) {
          console.warn('Skipping username generation - offline');
        } else {
          throw usernameError;
        }
      }
    }
    
    // If storeName changed and username exists, regenerate username
    if (existingStore?.exists() && storeData.storeName) {
      const existingData = existingStore.data();
      if (existingData.storeName !== storeData.storeName && !storeData.username) {
        try {
          username = await generateUniqueUsername(storeData.storeName, userId);
        } catch (usernameError) {
          // If offline, skip username generation
          if (usernameError.code === 'unavailable' || 
              usernameError.message?.includes('offline')) {
            console.warn('Skipping username regeneration - offline');
            username = existingData.username || username; // Keep existing if available
          } else {
            throw usernameError;
          }
        }
      } else if (existingData.username) {
        username = existingData.username; // Keep existing username
      }
    }
    
    const storeDataToSave = {
      ...storeData,
      username: username || null,
      userId: userId,
      updatedAt: serverTimestamp(),
    };
    
    // Add createdAt only if document doesn't exist
    if (!existingStore?.exists()) {
      storeDataToSave.createdAt = serverTimestamp();
    }
    
    // Save to Firestore (will queue if offline)
    await setDoc(storeDocRef, storeDataToSave, { merge: true });
    
    // Try to return the saved data, but handle offline gracefully
    try {
      const savedDoc = await getDoc(storeDocRef);
      return {
        id: savedDoc.id,
        ...savedDoc.data(),
      };
    } catch (getDocError) {
      // If offline, return the data we tried to save
      if (getDocError.code === 'unavailable' || 
          getDocError.message?.includes('offline') ||
          getDocError.message?.includes('Failed to get document')) {
        return {
          id: userId,
          ...storeDataToSave,
        };
      }
      throw getDocError;
    }
  } catch (error) {
    // Only log non-offline errors
    if (error.code === 'unavailable' || 
        error.message?.includes('offline') ||
        error.message?.includes('Failed to get document')) {
      // Silently handle offline errors - Firestore will sync when online
      console.warn('Firestore offline - data will sync when connection is restored');
      // Return the data we tried to save
      return {
        id: userId,
        ...storeData,
        userId: userId,
      };
    }
    console.error('Error saving store to Firestore:', error);
    throw error;
  }
};

/**
 * Create initial store document for a new user
 * @param {string} userId - The user ID (Firebase Auth UID)
 * @returns {Promise<Object>} - Created store document
 */
export const createInitialStore = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const storeDocRef = doc(db, 'stores', userId);
    const storeData = {
      storeName: null,
      username: null,
      whatsappNumber: '',
      bannerImage: null,
      logo: null,
      description: null,
      storeRating: 0,
      storeRatingCount: 0,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(storeDocRef, storeData);
    
    return {
      id: userId,
      ...storeData,
    };
  } catch (error) {
    console.error('Error creating initial store:', error);
    throw error;
  }
};

/**
 * Add a product to Firestore
 * @param {string} storeId - The store ID (user.uid)
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product document
 */
export const addProductToFirestore = async (storeId, productData) => {
  try {
    if (!storeId) {
      throw new Error('Store ID is required');
    }
    
    const productsRef = collection(db, 'products');
    const productToSave = {
      ...productData,
      storeId: storeId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Add to Firestore (will queue if offline)
    const docRef = await addDoc(productsRef, productToSave);
    
    // Try to return the created product, but handle offline gracefully
    try {
      const productDoc = await getDoc(docRef);
      return {
        id: productDoc.id,
        ...productDoc.data(),
      };
    } catch (getDocError) {
      // If offline, return the data we tried to save with a generated ID
      if (getDocError.code === 'unavailable' || 
          getDocError.message?.includes('offline') ||
          getDocError.message?.includes('Failed to get document')) {
        return {
          id: docRef.id || Date.now().toString(),
          ...productToSave,
        };
      }
      throw getDocError;
    }
  } catch (error) {
    // Only log non-offline errors
    if (error.code === 'unavailable' || 
        error.message?.includes('offline') ||
        error.message?.includes('Failed to get document')) {
      // Silently handle offline errors - Firestore will sync when online
      console.warn('Firestore offline - product will sync when connection is restored');
      // Return the data we tried to save with a generated ID
      return {
        id: Date.now().toString(),
        ...productData,
        storeId: storeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    console.error('Error adding product to Firestore:', error);
    throw error;
  }
};

/**
 * Update a product in Firestore
 * @param {string} productId - The product document ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} - Updated product document
 */
export const updateProductInFirestore = async (productId, productData) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    const productDocRef = doc(db, 'products', productId);
    const productToSave = {
      ...productData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(productDocRef, productToSave);
    
    // Return the updated product
    const productDoc = await getDoc(productDocRef);
    return {
      id: productDoc.id,
      ...productDoc.data(),
    };
  } catch (error) {
    console.error('Error updating product in Firestore:', error);
    throw error;
  }
};

/**
 * Delete a product from Firestore
 * @param {string} productId - The product document ID
 * @returns {Promise<void>}
 */
export const deleteProductFromFirestore = async (productId) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    const productDocRef = doc(db, 'products', productId);
    await deleteDoc(productDocRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    throw error;
  }
};



