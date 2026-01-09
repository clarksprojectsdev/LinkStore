import { Platform } from 'react-native';

/**
 * Detects if the current device is a mobile device (iOS or Android)
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
  if (Platform.OS !== 'web') {
    return true; // React Native app is always mobile
  }

  if (typeof window === 'undefined') {
    return false;
  }

  // Check user agent for mobile devices
  const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  return mobileRegex.test(userAgent.toLowerCase());
};

/**
 * Detects if the device is iOS
 * @returns {boolean} True if iOS device
 */
export const isIOS = () => {
  if (Platform.OS === 'ios') {
    return true;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
    return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  }

  return false;
};

/**
 * Detects if the device is Android
 * @returns {boolean} True if Android device
 */
export const isAndroid = () => {
  if (Platform.OS === 'android') {
    return true;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
    return /android/i.test(userAgent);
  }

  return false;
};

/**
 * Creates a WhatsApp URL that opens the app on mobile, or WhatsApp Web on desktop
 * @param {string} phoneNumber - Phone number in international format (e.g., "2341234567890")
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp URL
 */
export const createWhatsAppUrl = (phoneNumber, message = '') => {
  // Remove any non-digit characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  const encodedMessage = encodeURIComponent(message);
  
  // On mobile devices, try to open WhatsApp app first
  if (isMobileDevice()) {
    // Use whatsapp:// protocol for native app
    // This works on both iOS and Android
    if (message) {
      return `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
    } else {
      return `whatsapp://send?phone=${cleanPhone}`;
    }
  }
  
  // On desktop/web, use WhatsApp Web
  if (message) {
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  } else {
    return `https://wa.me/${cleanPhone}`;
  }
};

/**
 * Opens WhatsApp with a phone number and optional message
 * Handles both mobile app and web automatically
 * @param {string} phoneNumber - Phone number in international format
 * @param {string} message - Pre-filled message
 * @param {Function} onError - Optional error callback
 */
export const openWhatsApp = (phoneNumber, message = '', onError = null) => {
  if (!phoneNumber) {
    if (onError) {
      onError(new Error('WhatsApp number not provided'));
    }
    return;
  }

  const whatsappUrl = createWhatsAppUrl(phoneNumber, message);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // On web (both desktop and mobile web browsers)
    if (isMobileDevice()) {
      // Try to open WhatsApp app first
      // Create a hidden iframe to attempt app opening
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = whatsappUrl;
      document.body.appendChild(iframe);
      
      // Fallback to WhatsApp Web after a short delay
      setTimeout(() => {
        document.body.removeChild(iframe);
        // If app didn't open, fallback to web
        const webUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      // Desktop: directly open WhatsApp Web
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  } else {
    // React Native: use Linking API
    const { Linking } = require('react-native');
    
    // Try WhatsApp app first
    const appUrl = `whatsapp://send?phone=${phoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(appUrl);
        } else {
          // Fallback to WhatsApp Web
          const webUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening WhatsApp:', err);
        if (onError) {
          onError(err);
        }
      });
  }
};
