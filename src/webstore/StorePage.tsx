import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { openWhatsApp } from '../../utils/whatsappHelpers';

interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  createdAt?: string;
}

interface Store {
  id: string;
  username: string;
  storeName: string;
  description?: string;
  logo?: string;
  bannerImage?: string;
  whatsappNumber?: string;
  storeRating?: number;
  storeRatingCount?: number;
}

interface StorePageProps {
  username: string;
}

const StorePage: React.FC<StorePageProps> = ({ username }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStoreData();
  }, [username]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch store by username
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      // Get the first matching store
      const storeDoc = querySnapshot.docs[0];
      const storeData = {
        id: storeDoc.id,
        ...storeDoc.data(),
      } as Store;

      setStore(storeData);

      // Fetch products for this store
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('storeId', '==', storeDoc.id));
      const productsSnapshot = await getDocs(productsQuery);

      const productsData: Product[] = [];
      productsSnapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      // Sort by creation date (newest first)
      productsData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching store data:', err);
      setError('Failed to load store. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = (product: Product) => {
    if (!store?.whatsappNumber) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('WhatsApp number not available for this store');
      }
      return;
    }

    // Ensure product title is properly encoded
    const productName = product.title || 'this product';
    const message = `I want to order ${productName}`;
    
    // Use WhatsApp helper to open app on mobile, web on desktop
    openWhatsApp(store.whatsappNumber, message, (error) => {
      console.error('Error opening WhatsApp:', error);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Could not open WhatsApp. Please try again.');
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading store...</Text>
        </View>
      </View>
    );
  }

  if (error || !store) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Store not found'}</Text>
          <Text style={styles.errorSubtext}>
            The store you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Store Header */}
      <View style={styles.header}>
        {store.bannerImage && (
          <Image source={{ uri: store.bannerImage }} style={styles.bannerImage} />
        )}
        <View style={styles.storeInfo}>
          {store.logo && (
            <Image source={{ uri: store.logo }} style={styles.logo} />
          )}
          <View style={styles.storeDetails}>
            <Text style={styles.storeName}>{store.storeName}</Text>
            {store.description && (
              <Text style={styles.storeDescription}>{store.description}</Text>
            )}
            {store.storeRating && store.storeRating > 0 && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>
                  ⭐ {store.storeRating.toFixed(1)} ({store.storeRatingCount || 0} reviews)
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Products Section */}
      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>
          Products ({products.length})
        </Text>

        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No products available yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for amazing products!
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => {
              const hasImage = product.image && !imageErrors.has(product.id);
              return (
                <View key={product.id} style={styles.productCard}>
                  {hasImage ? (
                    <Image 
                      source={{ uri: product.image }} 
                      style={styles.productImage}
                      onError={() => {
                        // Track failed images to show placeholder
                        setImageErrors(prev => new Set(prev).add(product.id));
                      }}
                    />
                  ) : (
                    <View style={[styles.productImage, styles.productImagePlaceholder]}>
                      <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                  )}
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  {product.description && (
                    <Text style={styles.productDescription} numberOfLines={2}>
                      {product.description}
                    </Text>
                  )}
                  <Text style={styles.productPrice}>₦{product.price.toLocaleString()}</Text>
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => handleWhatsAppOrder(product)}
                  >
                    <Text style={styles.whatsappButtonText}>Order on WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by LinkStore</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  storeInfo: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#e9ecef',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  storeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  ratingContainer: {
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  productsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  productsGrid: {
    gap: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f8f9fa',
  },
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 16,
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  whatsappButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default StorePage;

