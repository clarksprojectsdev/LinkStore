import React, { useEffect } from 'react';
import { Platform } from 'react-native';

// React Native Web supports rendering HTML head elements directly

// Default fallback image for SEO
const DEFAULT_IMAGE = 'https://linkstore.app/assets/og-default.png';

interface StoreSEOProps {
  title: string;
  description: string;
  image: string;
  url: string;
}

/**
 * StoreSEO Component
 * 
 * Renders SEO meta tags (OpenGraph, Twitter Cards, Standard) for store pages.
 * Only renders on web platform to avoid affecting mobile builds.
 * 
 * @param title - Store name or page title
 * @param description - Store description (will be truncated to 150 chars)
 * @param image - Store banner/logo image URL
 * @param url - Canonical URL of the store page
 */
const StoreSEO: React.FC<StoreSEOProps> = ({ title, description, image, url }) => {
  // Platform safety - only render on web
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return null;
  }

  // Sanitize and truncate description
  const sanitizedDescription = description
    ? description.trim().substring(0, 150).replace(/\s+/g, ' ')
    : 'Visit this store on LinkStore';

  // Ensure image URL is absolute
  const imageUrl = image || DEFAULT_IMAGE;
  const absoluteImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `https://linkstore.app${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;

  // Ensure URL is absolute
  const absoluteUrl = url.startsWith('http') ? url : `https://linkstore.app${url.startsWith('/') ? url : '/' + url}`;

  // React Native Web supports rendering head elements when wrapped in a fragment
  // We'll use useEffect to inject into document.head for better compatibility
  useEffect(() => {
    // Set document title
    const originalTitle = document.title;
    document.title = `${title} – LinkStore`;

    // Create and inject meta tags
    const metaTags: HTMLElement[] = [];

    const createOrUpdateMeta = (selector: string, attributes: Record<string, string>) => {
      let element = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement;
      if (!element) {
        const tagName = selector.includes('link') ? 'link' : 'meta';
        element = document.createElement(tagName) as HTMLMetaElement | HTMLLinkElement;
        document.head.appendChild(element);
        metaTags.push(element);
      }
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    };

    // Standard SEO Meta Tags
    createOrUpdateMeta('meta[name="description"]', { name: 'description', content: sanitizedDescription });
    createOrUpdateMeta('meta[name="keywords"]', { name: 'keywords', content: `${title}, LinkStore, online store, shopping, products` });
    createOrUpdateMeta('link[rel="canonical"]', { rel: 'canonical', href: absoluteUrl });

    // OpenGraph Meta Tags
    createOrUpdateMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    createOrUpdateMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    createOrUpdateMeta('meta[property="og:description"]', { property: 'og:description', content: sanitizedDescription });
    createOrUpdateMeta('meta[property="og:image"]', { property: 'og:image', content: absoluteImageUrl });
    createOrUpdateMeta('meta[property="og:url"]', { property: 'og:url', content: absoluteUrl });
    createOrUpdateMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'LinkStore' });

    // Twitter Card Meta Tags
    createOrUpdateMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    createOrUpdateMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    createOrUpdateMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: sanitizedDescription });
    createOrUpdateMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: absoluteImageUrl });

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      // Meta tags persist in head, which is desired for SEO
    };
  }, [title, sanitizedDescription, absoluteImageUrl, absoluteUrl]);

  // Return null - component only manipulates DOM
  return null;
};

export default StoreSEO;

