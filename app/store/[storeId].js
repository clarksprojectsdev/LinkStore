import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import StoreHero from '../../components/store/StoreHero';
import CategoryRow from '../../components/store/CategoryRow';
import ProductGrid from '../../components/store/ProductGrid';
import StoreSEO from '../../src/webstore/components/StoreSEO';

// Default fallback image for SEO
const DEFAULT_SEO_IMAGE = 'https://linkstore.app/assets/og-default.png';

export default function StorePage() {
  // Platform safety - only render on web
  if (Platform.OS !== 'web') {
    return null;
  }
  const { storeId } = useLocalSearchParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // storeId is actually the username from the URL
      const username = storeId;

      // Fetch store by username (not by document ID)
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
      };
      setStore(storeData);

      // Fetch products from products collection where storeId matches
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('storeId', '==', storeDoc.id));
      const productsSnapshot = await getDocs(productsQuery);

      const productsData = [];
      const categorySet = new Set();

      productsSnapshot.forEach((doc) => {
        const productData = {
          id: doc.id,
          ...doc.data(),
        };
        productsData.push(productData);

        // Collect unique categories
        if (productData.category) {
          categorySet.add(productData.category);
        }
      });

      // Sort products by creation date (newest first)
      productsData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return dateB - dateA;
      });

      setProducts(productsData);
      setCategories(Array.from(categorySet).sort());
    } catch (err) {
      console.error('Error fetching store data:', err);
      setError('Failed to load store. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6f4cff" />
          <Text style={styles.loadingText}>Loading store...</Text>
        </View>
      </View>
    );
  }

  // Error state with fallback SEO
  if (error || !store) {
    return (
      <>
        <StoreSEO
          title="Store not found"
          description="This store does not exist or has been removed."
          image={DEFAULT_SEO_IMAGE}
          url={`https://linkstore.app/store/${storeId}`}
        />
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Store not found'}</Text>
            <Text style={styles.errorSubtext}>
              The store you're looking for doesn't exist or has been removed.
            </Text>
          </View>
        </View>
      </>
    );
  }

  // Get username from store data (fallback to storeId if username not available)
  const username = store.username || storeId;
  const seoImage = store.bannerImage || store.logo || DEFAULT_SEO_IMAGE;
  const seoDescription = store.description || store.tagline || 'Visit this store on LinkStore';

  return (
    <>
      <StoreSEO
        title={store.storeName || 'Store'}
        description={seoDescription}
        image={seoImage}
        url={`https://linkstore.app/store/${username}`}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <StoreHero
          bannerImage={store.bannerImage}
          logo={store.logo}
          storeName={store.storeName}
          tagline={store.description || store.tagline}
        />

        {categories.length > 0 && (
          <CategoryRow
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        <ProductGrid products={filteredProducts} whatsappNumber={store.whatsappNumber} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
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
});

