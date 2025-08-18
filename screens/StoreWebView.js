import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../context/StoreContext';

const StoreWebView = ({ route }) => {
  const { storeData, products } = useStore();
  const { storeId } = route.params || {};

  const handleWhatsAppOrder = (product) => {
    if (!storeData.whatsappNumber) {
      Alert.alert('Contact Not Available', 'WhatsApp number not set for this store.');
      return;
    }

    const message = `Hi! I'm interested in ordering ${product.title} for $${product.price}. Can you provide more details?`;
    const whatsappUrl = `whatsapp://send?phone=${storeData.whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed on this device');
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not open WhatsApp');
      });
  };

  const renderProductCard = (product) => (
    <View key={product.id} style={styles.productCard}>
      {product.image ? (
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color="#ccc" />
        </View>
      )}
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description || 'No description available'}
        </Text>
        
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>${product.price}</Text>
          {product.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={() => handleWhatsAppOrder(product)}
        >
          <Ionicons name="logo-whatsapp" size={16} color="white" />
          <Text style={styles.whatsappButtonText}>Order on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <View style={styles.storeIcon}>
            <Ionicons name="storefront" size={24} color="white" />
          </View>
          <View style={styles.storeDetails}>
            <Text style={styles.storeName}>{storeData.storeName || 'My Store'}</Text>
            <Text style={styles.productCount}>
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </Text>
          </View>
        </View>
      </View>

      {/* Store Banner */}
      {storeData.bannerImage && (
        <Image
          source={{ uri: storeData.bannerImage }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      )}

      {/* Products Grid */}
      <ScrollView style={styles.productsContainer} showsVerticalScrollIndicator={false}>
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No products available yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for amazing products!
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map(renderProductCard)}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by LinkStore
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#28a745',
    padding: 20,
    paddingTop: 30,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  productCount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bannerImage: {
    width: '100%',
    height: 150,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productsGrid: {
    paddingVertical: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productImagePlaceholder: {
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  productInfo: {
    padding: 15,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25d366',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default StoreWebView;
