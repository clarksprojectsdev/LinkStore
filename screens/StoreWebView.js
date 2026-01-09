import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../context/StoreContext';
import ReportSeller from '../components/ReportSeller';
import VideoPreview from '../components/VideoPreview';
import RateVendorModal from '../components/RateVendorModal';
import SafetyTipsModal from '../components/SafetyTipsModal';

const StoreWebView = ({ route }) => {
  const { storeData, products, updateStoreRating } = useStore();
  const { storeId } = route.params || {};
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  
  // Safety tips modal state
  const [showSafetyModal, setShowSafetyModal] = useState(false);


  // Clear vendor flag when customer accesses store web view
  useEffect(() => {
    const clearVendorFlag = async () => {
      try {
        await AsyncStorage.setItem('isVendor', 'false');
      } catch (error) {
        console.warn('Could not clear vendor flag:', error);
      }
    };
    clearVendorFlag();
  }, []);

  // Check if user returned from WhatsApp (simple detection)
  useEffect(() => {
    const checkForReturnFromWhatsApp = async () => {
      try {
        // This is a simple implementation - in a real app you might use deep linking
        // or more sophisticated tracking to detect WhatsApp return
        const lastWhatsAppTime = await AsyncStorage.getItem('lastWhatsAppOrder');
        if (lastWhatsAppTime) {
          const timeDiff = Date.now() - parseInt(lastWhatsAppTime);
          // Show rating modal if user returned within 5 minutes
          if (timeDiff < 5 * 60 * 1000) {
            // Check if user is not the vendor (simple check)
            const isVendor = await AsyncStorage.getItem('isVendor');
            if (isVendor !== 'true') {
              setShowRatingModal(true);
            }
            await AsyncStorage.removeItem('lastWhatsAppOrder');
          }
        }
      } catch (error) {
        console.warn('Error checking WhatsApp return:', error);
      }
    };

    checkForReturnFromWhatsApp();
  }, []);

  const handleRatingSubmit = async (rating) => {
    try {
      setIsRatingLoading(true);
      await updateStoreRating(rating);
      setShowRatingModal(false);
      Alert.alert('Thank You!', 'Your rating has been submitted successfully.');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleRatingClose = () => {
    setShowRatingModal(false);
  };

  const handleSafetyTipsPress = () => {
    setShowSafetyModal(true);
  };

  const handleSafetyClose = () => {
    setShowSafetyModal(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFD700" />
        );
      }
    }
    
    return stars;
  };


  const handleWhatsAppOrder = (product) => {
    if (!storeData.whatsappNumber) {
      Alert.alert('Contact Not Available', 'WhatsApp number not set for this store.');
      return;
    }

    // Track WhatsApp order for rating prompt
    const trackWhatsAppOrder = async () => {
      try {
        await AsyncStorage.setItem('lastWhatsAppOrder', Date.now().toString());
      } catch (error) {
        console.warn('Could not track WhatsApp order:', error);
      }
    };
    trackWhatsAppOrder();

    const message = `Hi! I'm interested in ordering ${product.title} for ₦${product.price.toLocaleString()}. Can you provide more details?`;
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
      <VideoPreview
        videoUri={product.previewVideo}
        imageUri={product.image}
        style={styles.productImage}
        autoPlay={true}
        loop={true}
        muted={true}
        showControls={false}
        resizeMode="cover"
        onError={(error) => {
          console.warn('Video preview error for product:', product.id, error);
        }}
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description || 'No description available'}
        </Text>
        
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>₦{product.price.toLocaleString()}</Text>
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
          <Ionicons name="logo-whatsapp" size={14} color="white" />
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
            <View style={styles.headerRatingContainer}>
              {storeData.storeRating > 0 ? (
                renderStars(storeData.storeRating)
              ) : (
                <Text style={styles.noRatingText}>No ratings yet</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Safety Tips Icon */}
        <TouchableOpacity
          style={styles.safetyButton}
          onPress={handleSafetyTipsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark" size={24} color="white" />
        </TouchableOpacity>
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


      {/* Floating Report Button */}
      <View style={styles.floatingReportContainer}>
        <ReportSeller 
          storeId={storeId || storeData.username || storeData.storeName?.toLowerCase().replace(/\s+/g, '-') || 'my-store'}
          onReportSubmit={() => {
            Alert.alert('Report Submitted', 'Thank you for your report. We will investigate this matter.');
          }}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by LinkStore
        </Text>
      </View>

      {/* Rating Modal */}
      <RateVendorModal
        visible={showRatingModal}
        onClose={handleRatingClose}
        onRate={handleRatingSubmit}
        storeName={storeData.storeName || 'this vendor'}
        isLoading={isRatingLoading}
      />

      {/* Safety Tips Modal */}
      <SafetyTipsModal
        visible={showSafetyModal}
        onClose={handleSafetyClose}
      />

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
    padding: 15,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    borderRadius: 10,
    marginBottom: 16,
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
    height: 160,
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
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 18,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  floatingReportContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  headerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  noRatingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  safetyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 10,
  },
});

export default StoreWebView;
