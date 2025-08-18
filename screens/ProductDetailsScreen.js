import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useStore } from '../context/StoreContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const { storeData } = useStore();

  const handleWhatsAppOrder = () => {
    if (!storeData.whatsappNumber) {
      Alert.alert(
        'WhatsApp Number Not Set',
        'Please set your WhatsApp number in the vendor setup first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Setup Now', onPress: () => navigation.navigate('VendorSetup') }
        ]
      );
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

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
              onError={() => {
                // Handle image loading error
                console.log('Failed to load product image');
              }}
            />
          ) : (
            <View style={[styles.productImage, styles.productImagePlaceholder]}>
              <Ionicons name="image-outline" size={64} color="#ccc" />
              <Text style={styles.imagePlaceholderText}>No Image Available</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>
          
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* WhatsApp Order Button */}
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={handleWhatsAppOrder}
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text style={styles.whatsappButtonText}>Order on WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              Added {new Date(product.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="storefront-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{storeData.storeName}</Text>
          </View>

          {product.category && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{product.category}</Text>
            </View>
          )}

          {product.rating > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.infoText}>
                {product.rating.toFixed(1)} ({product.ratingCount} reviews)
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 16,
    marginTop: 8,
  },
  productInfo: {
    padding: 20,
  },
  productTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    lineHeight: 34,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25d366',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  additionalInfo: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default ProductDetailsScreen;
