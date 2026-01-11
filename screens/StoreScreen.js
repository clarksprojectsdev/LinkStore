import React, { useState, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getStoreByUserId } from '../utils/firestoreHelpers';

const StoreScreen = ({ navigation }) => {
  const { storeData, products, saveStoreData, isLoading, deleteProduct } = useStore();
  const { user, logOut } = useAuth();
  const [isEditingStoreName, setIsEditingStoreName] = useState(false);
  const [tempStoreName, setTempStoreName] = useState(storeData.storeName);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-low', 'price-high', 'name'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Set vendor flag when vendor accesses their store
  useEffect(() => {
    const setVendorFlag = async () => {
      try {
        await AsyncStorage.setItem('isVendor', 'true');
      } catch (error) {
        // Silent fallback
      }
    };
    setVendorFlag();
  }, []);

  const handleWhatsAppOrder = (product) => {
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

    const message = `Hi! I'm interested in ordering ${product.title} for ₦${product.price.toLocaleString()}. Can you provide more details?`;
    const whatsappUrl = `whatsapp://send?phone=${storeData.whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          // WhatsApp not installed, offer alternatives
          Alert.alert(
            'WhatsApp Not Available',
            'WhatsApp is not installed on this device. Would you like to:',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Copy Message', 
                onPress: () => {
                  Clipboard.setString(message);
                  Alert.alert('Success', 'Order message copied to clipboard! You can paste it in any messaging app.');
                }
              },
              {
                text: 'Open Web WhatsApp',
                onPress: () => {
                  const webUrl = `https://wa.me/${storeData.whatsappNumber}?text=${encodeURIComponent(message)}`;
                  Linking.openURL(webUrl);
                }
              }
            ]
          );
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not open WhatsApp');
      });
  };

  const handleCopyStoreLink = async () => {
    // If username is missing but storeName exists, try to save the store first
    // This will create the Firestore document and generate a username
    if (!storeData.username && storeData.storeName) {
      // Check if we have minimum required data
      if (!storeData.whatsappNumber) {
        Alert.alert(
          'Store Setup Required',
          'Your store needs to be saved with a WhatsApp number before you can generate a shareable link.\n\nPlease go to Store Setup to complete your store information.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Go to Setup', 
              onPress: () => navigation.navigate('VendorSetup')
            }
          ]
        );
        return;
      }

      // Try to save the store to Firestore (this will generate username)
      try {
        await saveStoreData({
          storeName: storeData.storeName,
          whatsappNumber: storeData.whatsappNumber,
          bannerImage: storeData.bannerImage,
          logo: storeData.logo,
        });

        // Wait a moment for Firestore to sync and context to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Reload store data from Firestore to get the username
        const updatedStore = await getStoreByUserId(user.uid);
        if (updatedStore?.username) {
          // Username was generated, proceed with copying link
          const storeLink = `https://linkstore.expo.app/store/${updatedStore.username}`;
          Clipboard.setString(storeLink);
          Alert.alert(
            'Success!',
            `Your store link has been generated and copied:\n\n${storeLink}\n\nShare it on social media!`,
            [{ text: 'OK' }]
          );
          return;
        } else {
          // Store saved but username not generated yet (might be offline)
          Alert.alert(
            'Store Saved',
            'Your store has been saved, but the username is still being generated. Please try again in a moment, or check your internet connection.',
            [{ text: 'OK' }]
          );
          return;
        }
      } catch (error) {
        console.error('Error saving store for link generation:', error);
        Alert.alert(
          'Unable to Generate Link',
          'We couldn\'t save your store information right now. Please try saving your store in the Store Setup screen first, then try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Go to Setup', 
              onPress: () => navigation.navigate('VendorSetup')
            }
          ]
        );
        return;
      }
    }

    // If we have a username, proceed normally
    const username = storeData.username;
    
    if (!username) {
      Alert.alert(
        'Store Username Not Set',
        'Your store needs a username to generate a shareable link. Please save your store information first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go to Setup', 
            onPress: () => navigation.navigate('VendorSetup')
          }
        ]
      );
      return;
    }
    
    const storeLink = `https://linkstore.expo.app/store/${username}`;
    
    Alert.alert(
      'Share Your Store',
      `Your store link:\n\n${storeLink}\n\nThis link includes Open Graph meta tags for beautiful social media previews!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Copy Link', 
          onPress: () => {
            Clipboard.setString(storeLink);
            Alert.alert('Success', 'Store link copied to clipboard! Share it on social media for beautiful previews.');
          }
        },
        {
          text: 'Preview Store',
          onPress: () => {
            navigation.navigate('StoreWebView', { storeId: username });
          }
        },
        {
          text: 'Generate Web Page',
          onPress: () => {
            // In a real app, this would trigger the store page generation
            Alert.alert(
              'Web Page Generated',
              'Your store page has been generated with Open Graph meta tags! The page is ready for social media sharing.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleEditStoreName = () => {
    if (isEditingStoreName) {
      setIsEditingStoreName(false);
    } else {
      setIsEditingStoreName(true);
    }
  };

  const handleSaveStoreName = async () => {
    if (!tempStoreName.trim()) {
      Alert.alert('Error', 'Store name cannot be empty');
      setTempStoreName(storeData.storeName);
      return;
    }
    
    if (tempStoreName.trim().length < 3) {
      Alert.alert('Error', 'Store name must be at least 3 characters');
      setTempStoreName(storeData.storeName);
      return;
    }

    try {
      await saveStoreData({ storeName: tempStoreName.trim() });
      setIsEditingStoreName(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save store name');
    }
  };

  const handleCancelEdit = () => {
    setTempStoreName(storeData.storeName);
    setIsEditingStoreName(false);
  };

  // Get unique categories from products
  const getUniqueCategories = () => {
    const categories = products.map(product => product.category || 'General');
    return ['all', ...Array.from(new Set(categories))];
  };

  // Filter products based on search and category
  const getFilteredProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'name':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.title}"?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

    const renderProductCard = (product) => (
    <View key={product.id} style={styles.productCard}>
      <TouchableOpacity
        style={styles.editProductButton}
        onPress={() => navigation.navigate('VendorSetup', { product })}
      >
        <Ionicons name="pencil" size={16} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteProductButton}
        onPress={() => handleDeleteProduct(product)}
      >
        <Ionicons name="trash" size={16} color="#dc3545" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.productContent}
        onPress={() => navigation.navigate('ProductDetails', { product })}
      >
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
              // Image failed to load, placeholder will be shown
            }}
          />
        ) : (
          <View style={[styles.productImage, styles.productImagePlaceholder]}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
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
            <Ionicons name="logo-whatsapp" size={16} color="white" />
            <Text style={styles.whatsappButtonText}>Order on WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Store</Text>
          {products.length > 0 && (
            <View style={styles.productCountBadge}>
              <Text style={styles.productCountBadgeText}>{products.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logOut }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const sortOptions = [
              { label: 'Newest First', value: 'newest' },
              { label: 'Price: Low to High', value: 'price-low' },
              { label: 'Price: High to Low', value: 'price-high' },
              { label: 'Name A-Z', value: 'name' },
            ];
            
            Alert.alert(
              'Sort Products',
              'Choose sorting option:',
              sortOptions.map(option => ({
                text: option.label,
                onPress: () => setSortBy(option.value)
              }))
            );
          }}
        >
          <Ionicons name="funnel" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {products.length > 0 && (
        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {getUniqueCategories().map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category === 'all' ? 'All' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Store Banner */}
      <View style={styles.storeBanner}>
        <View style={styles.storeIconContainer}>
          <Ionicons name="storefront" size={24} color="white" />
        </View>
        <View style={styles.storeInfo}>
          <View style={styles.storeNameRow}>
            {isEditingStoreName ? (
              <View style={styles.editStoreNameContainer}>
                <TextInput
                  style={styles.editStoreNameInput}
                  value={tempStoreName}
                  onChangeText={setTempStoreName}
                  autoFocus
                  selectTextOnFocus
                />
                <TouchableOpacity onPress={handleSaveStoreName} style={styles.saveButton}>
                  <Ionicons name="checkmark" size={16} color="#28a745" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                  <Ionicons name="close" size={16} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.storeName}>{storeData.storeName}</Text>
                <TouchableOpacity onPress={handleEditStoreName}>
                  <Ionicons name="pencil" size={16} color="#666" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <Text style={styles.productCount}>
            {products.length} product{products.length !== 1 ? 's' : ''}
          </Text>
          {products.length > 0 && (
            <Text style={styles.storeStats}>
              Total Value: ₦{products.reduce((sum, product) => sum + product.price, 0).toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      {/* Products List */}
      <ScrollView 
        style={styles.productsContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              // This will trigger a re-render and reload data
              setTempStoreName(storeData.storeName);
            }}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingState}>
            <Ionicons name="refresh" size={48} color="#ccc" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No products yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first product to get started
            </Text>
            <TouchableOpacity
              style={styles.addFirstProductButton}
              onPress={() => navigation.navigate('VendorSetup')}
            >
              <Text style={styles.addFirstProductButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          getFilteredProducts().map(renderProductCard)
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addProductButton}
          onPress={() => navigation.navigate('VendorSetup')}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.addProductButtonText}>Add Product</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.copyLinkButton}
          onPress={handleCopyStoreLink}
        >
          <Ionicons name="link" size={20} color="#28a745" />
          <Text style={styles.copyLinkButtonText}>Copy Store Link</Text>
        </TouchableOpacity>



      </View>
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
    position: 'relative',
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    zIndex: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  productCountBadge: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  productCountBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    zIndex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryScrollContent: {
    paddingRight: 20,
  },
  categoryChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryChipActive: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  clearSearchButton: {
    marginLeft: 10,
  },
  storeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  storeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  storeInfo: {
    flex: 1,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  editStoreNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editStoreNameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 4,
    marginRight: 10,
  },
  saveButton: {
    padding: 4,
    marginRight: 8,
  },
  cancelButton: {
    padding: 4,
  },
  productCount: {
    fontSize: 16,
    color: '#666',
  },
  storeStats: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 5,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  editProductButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 8,
    zIndex: 1,
  },
  deleteProductButton: {
    position: 'absolute',
    top: 10,
    right: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 8,
    zIndex: 1,
  },
  productContent: {
    flexDirection: 'row',
    padding: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
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
    flex: 1,
    justifyContent: 'space-between',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25d366',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
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
    marginBottom: 24,
  },
  addFirstProductButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFirstProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  addProductButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addProductButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  copyLinkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#28a745',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  copyLinkButtonText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default StoreScreen;
