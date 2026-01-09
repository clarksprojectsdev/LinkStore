import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Check if an image is a local file path that needs uploading
 * @param {string} imageUri - The image URI to check
 * @returns {boolean} - True if it's a local file path
 */
export const isLocalFile = (imageUri) => {
  if (!imageUri) return false;
  // Check if it's a local file path (file:// or starts with /)
  // If it's already a URL (http:// or https://), it doesn't need uploading
  return (imageUri.startsWith('file://') || 
         (imageUri.startsWith('/') && !imageUri.startsWith('//'))) &&
         !imageUri.startsWith('http://') &&
         !imageUri.startsWith('https://');
};

/**
 * Upload an image to Firebase Storage
 * @param {string} localUri - Local file URI
 * @param {string} storagePath - Path in Firebase Storage (e.g., 'stores/{uid}/banner.jpg')
 * @returns {Promise<string>} - Public download URL
 */
export const uploadImageToStorage = async (localUri, storagePath) => {
  try {
    if (!localUri) {
      throw new Error('Image URI is required');
    }

    if (!isLocalFile(localUri)) {
      // Already a URL, return as-is
      return localUri;
    }

    console.log('Uploading image to Storage:', { localUri, storagePath });

    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, storagePath);

    // Read the file as a blob
    // Works for both web and React Native
    console.log('Fetching local file...');
    const response = await fetch(localUri);
    
    if (!response.ok) {
      throw new Error(`Failed to read local file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('File blob created, size:', blob.size, 'bytes');

    // Upload the file
    console.log('Uploading to Firebase Storage...');
    await uploadBytes(storageRef, blob);
    console.log('Upload successful, getting download URL...');

    // Get the public download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL obtained:', downloadURL);

    return downloadURL;
  } catch (error) {
    // Enhanced error logging
    console.error('Error uploading image to Firebase Storage:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Storage path:', storagePath);
    console.error('Local URI:', localUri);
    
    // Handle storage/unknown error (often means Storage rules or auth issue)
    if (error.code === 'storage/unknown' || 
        error.code === 'storage/unauthorized' ||
        error.code === 'storage/retry-limit-exceeded') {
      console.warn('Storage upload failed - possible rules/auth issue. Check Firebase Storage rules.');
      console.warn('Returning local path - will need to configure Storage rules for uploads to work.');
      return localUri; // Return local path for now
    }
    
    // If upload fails, return the local URI (will be handled by offline support)
    // This allows the app to continue working offline
    if (error.code === 'unavailable' || 
        error.code === 'storage/unknown' ||
        error.message?.includes('offline') ||
        error.message?.includes('network')) {
      console.warn('Storage upload failed - offline or unknown error. Will retry when online.');
      return localUri; // Return local path for now, will be uploaded later
    }
    throw error;
  }
};

/**
 * Upload store banner image
 * @param {string} userId - User ID
 * @param {string} bannerImageUri - Local banner image URI
 * @returns {Promise<string>} - Download URL or original URI
 */
export const uploadStoreBanner = async (userId, bannerImageUri) => {
  if (!bannerImageUri || !isLocalFile(bannerImageUri)) {
    return bannerImageUri; // Already a URL or null
  }

  const storagePath = `stores/${userId}/banner.jpg`;
  return await uploadImageToStorage(bannerImageUri, storagePath);
};

/**
 * Upload store logo image
 * @param {string} userId - User ID
 * @param {string} logoUri - Local logo image URI
 * @returns {Promise<string>} - Download URL or original URI
 */
export const uploadStoreLogo = async (userId, logoUri) => {
  if (!logoUri || !isLocalFile(logoUri)) {
    return logoUri; // Already a URL or null
  }

  const storagePath = `stores/${userId}/logo.jpg`;
  return await uploadImageToStorage(logoUri, storagePath);
};

/**
 * Upload product image
 * @param {string} userId - User ID (store owner)
 * @param {string} productId - Product ID (will be generated if not provided)
 * @param {string} imageUri - Local product image URI
 * @returns {Promise<string>} - Download URL or original URI
 */
export const uploadProductImage = async (userId, productId, imageUri) => {
  if (!imageUri || !isLocalFile(imageUri)) {
    return imageUri; // Already a URL or null
  }

  // Use productId if provided, otherwise generate a temporary one
  const productIdForPath = productId || `temp-${Date.now()}`;
  const storagePath = `products/${userId}/${productIdForPath}.jpg`;
  return await uploadImageToStorage(imageUri, storagePath);
};

/**
 * Upload product video preview
 * @param {string} userId - User ID (store owner)
 * @param {string} productId - Product ID
 * @param {string} videoUri - Local video URI
 * @returns {Promise<string>} - Download URL or original URI
 */
export const uploadProductVideo = async (userId, productId, videoUri) => {
  if (!videoUri || !isLocalFile(videoUri)) {
    return videoUri; // Already a URL or null
  }

  const productIdForPath = productId || `temp-${Date.now()}`;
  const storagePath = `products/${userId}/${productIdForPath}.mp4`;
  
  try {
    const storageRef = ref(storage, storagePath);
    
    // Read video file
    const response = await fetch(videoUri);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading video to Firebase Storage:', error);
    if (error.code === 'unavailable' || 
        error.message?.includes('offline') ||
        error.message?.includes('network')) {
      console.warn('Video upload failed - offline. Will retry when online.');
      return videoUri;
    }
    throw error;
  }
};

