import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { openWhatsApp } from '../../utils/whatsappHelpers';

const ProductGrid = ({ products, whatsappNumber }) => {
  const [imageErrors, setImageErrors] = useState(new Set());

  const handleWhatsAppOrder = (product) => {
    if (!whatsappNumber) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('WhatsApp number not available for this store');
      }
      return;
    }

    const message = `I'm interested in ${product.title}`;
    
    // Use helper function to open WhatsApp (app on mobile, web on desktop)
    openWhatsApp(whatsappNumber, message, (error) => {
      console.error('Error opening WhatsApp:', error);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Could not open WhatsApp. Please try again.');
      }
    });
  };

  if (products.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No products available yet</Text>
        <Text style={styles.emptyStateSubtext}>Check back later for amazing products!</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {products.map((product) => {
        const hasImage = product.image && !imageErrors.has(product.id);
        return (
          <View key={product.id} style={styles.card}>
            {hasImage ? (
              <Image
                source={{ uri: product.image }}
                style={styles.cardImage}
                resizeMode="cover"
                onError={() => {
                  setImageErrors((prev) => new Set(prev).add(product.id));
                }}
              />
            ) : (
              <View style={[styles.cardImage, styles.imagePlaceholder]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <Text style={styles.cardTitle} numberOfLines={2}>
              {product.title}
            </Text>
            <Text style={styles.price}>₦{product.price?.toLocaleString() || '0'}</Text>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() => handleWhatsAppOrder(product)}
            >
              <Text style={styles.whatsappBtnText}>Order on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      width: 'calc(50% - 9px)',
      minWidth: 200,
      maxWidth: 300,
    } : {
      width: '48%',
    }),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 18,
  },
  cardImage: {
    width: '100%',
    height: 170,
    backgroundColor: '#f8f9fa',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  cardTitle: {
    padding: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minHeight: 44,
  },
  price: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    color: '#6f4cff',
    fontWeight: '700',
    fontSize: 17,
  },
  whatsappBtn: {
    marginHorizontal: 10,
    marginBottom: 14,
    paddingVertical: 10,
    backgroundColor: '#25D366',
    borderRadius: 10,
    alignItems: 'center',
  },
  whatsappBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
});

export default ProductGrid;

