import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../context/StoreContext';
import { Ionicons } from '@expo/vector-icons';

const VendorSetupScreen = ({ navigation, route }) => {
  const { storeData, saveStoreData, addProduct, updateProduct } = useStore();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [activeTab, setActiveTab] = useState('product'); // 'product' or 'store'
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  
  // Store setup state
  const [storeName, setStoreName] = useState(storeData.storeName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(storeData.whatsappNumber || '');
  const [bannerImage, setBannerImage] = useState(storeData.bannerImage || null);
  
  // Product form state
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('General');
  const [productImage, setProductImage] = useState(null);

  useEffect(() => {
    if (route.params?.product) {
      const product = route.params.product;
      setIsAddingProduct(true);
      setProductTitle(product.title);
      setProductPrice(product.price.toString());
      setProductDescription(product.description || '');
      setProductImage(product.image);
    }
  }, [route.params]);

  const pickImage = async (type) => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'banner' ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Basic image validation
        if (imageUri) {
          // Check file extension
          const fileExtension = imageUri.split('.').pop()?.toLowerCase();
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
          
          if (!allowedExtensions.includes(fileExtension)) {
            Alert.alert('Invalid Image', 'Please select a valid image file (JPG, PNG, or WebP)');
            return;
          }
          
          // Check file size (if available)
          try {
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            const maxSize = 10 * 1024 * 1024; // 10MB limit
            
            if (fileInfo.exists && fileInfo.size && fileInfo.size > maxSize) {
              Alert.alert('File Too Large', 'Please select an image smaller than 10MB');
              return;
            }
          } catch (error) {
            console.log('Could not check file size:', error);
          }
          
          if (type === 'banner') {
            setBannerImage(imageUri);
          } else {
            setProductImage(imageUri);
          }
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSaveStore = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }

    if (storeName.trim().length < 3) {
      Alert.alert('Error', 'Store name must be at least 3 characters');
      return;
    }

    if (!whatsappNumber.trim()) {
      Alert.alert('Error', 'WhatsApp number is required');
      return;
    }

    // WhatsApp number validation (basic format check)
    const whatsappRegex = /^\+?[1-9]\d{1,14}$/;
    if (!whatsappRegex.test(whatsappNumber.trim().replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid WhatsApp number with country code (e.g., +1234567890)');
      return;
    }

    try {
      setIsSavingStore(true);
      await saveStoreData({
        storeName: storeName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        bannerImage,
      });
      
      Alert.alert('Success', 'Store information saved successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save store information');
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productTitle.trim()) {
      Alert.alert('Error', 'Product title is required');
      return;
    }

    if (productTitle.trim().length < 3) {
      Alert.alert('Error', 'Product title must be at least 3 characters');
      return;
    }

    if (!productPrice.trim() || isNaN(parseFloat(productPrice))) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const price = parseFloat(productPrice);
    if (price <= 0) {
      Alert.alert('Error', 'Price must be greater than 0');
      return;
    }

    if (price > 999999) {
      Alert.alert('Error', 'Price seems too high. Please check and try again');
      return;
    }

    if (!productImage) {
      Alert.alert('Error', 'Product image is required');
      return;
    }

    try {
      setIsSavingProduct(true);
      const newProduct = {
        title: productTitle.trim(),
        price: parseFloat(productPrice),
        description: productDescription.trim(),
        category: productCategory.trim(),
        image: productImage,
      };

      if (route.params?.product) {
        // Update existing product
        await updateProduct(route.params.product.id, newProduct);
        Alert.alert('Success', 'Product updated successfully!');
      } else {
        // Add new product
        await addProduct(newProduct);
        Alert.alert('Success', 'Product added successfully!');
      }
      
      // Reset form
      setProductTitle('');
      setProductPrice('');
      setProductDescription('');
      setProductCategory('General');
      setProductImage(null);
      
      // Go back to store screen
      navigation.navigate('Store');
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderStoreSetup = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Store Setup</Text>
      
      {/* Store Name */}
      <Text style={styles.label}>Store Name *</Text>
      <TextInput
        style={styles.input}
        value={storeName}
        onChangeText={setStoreName}
        placeholder="Enter store name"
        placeholderTextColor="#999"
      />

      {/* WhatsApp Number */}
      <Text style={styles.label}>WhatsApp Number *</Text>
      <TextInput
        style={styles.input}
        value={whatsappNumber}
        onChangeText={setWhatsappNumber}
        placeholder="Enter WhatsApp number (with country code)"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
      />

      {/* Banner Image */}
      <Text style={styles.label}>Banner Image</Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => pickImage('banner')}
      >
        {bannerImage ? (
          <Image source={{ uri: bannerImage }} style={styles.selectedImage} />
        ) : (
          <>
            <Ionicons name="camera" size={32} color="#999" />
            <Text style={styles.imagePickerText}>Tap to add banner image</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.saveButton, isSavingStore && styles.saveButtonDisabled]} 
        onPress={handleSaveStore}
        disabled={isSavingStore}
      >
        {isSavingStore ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Save Store</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAddProduct = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Add Product</Text>
      
      {/* Product Image */}
      <Text style={styles.label}>Product Image *</Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => pickImage('product')}
      >
        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.selectedImage} />
        ) : (
          <>
            <Ionicons name="camera" size={32} color="#999" />
            <Text style={styles.imagePickerText}>Tap to add product image</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Product Name */}
      <Text style={styles.label}>Product Name *</Text>
      <TextInput
        style={styles.input}
        value={productTitle}
        onChangeText={setProductTitle}
        placeholder="Enter product name"
        placeholderTextColor="#999"
      />

      {/* Price */}
      <Text style={styles.label}>Price *</Text>
      <TextInput
        style={styles.input}
        value={productPrice}
        onChangeText={setProductPrice}
        placeholder="0.00"
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
      />

      {/* Category */}
      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={productCategory}
        onChangeText={setProductCategory}
        placeholder="Enter product category"
        placeholderTextColor="#999"
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={productDescription}
        onChangeText={setProductDescription}
        placeholder="Enter product description (optional)"
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

              <TouchableOpacity 
          style={[styles.addProductButton, isSavingProduct && styles.addProductButtonDisabled]} 
          onPress={handleAddProduct}
          disabled={isSavingProduct}
        >
          {isSavingProduct ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.addProductButtonText}>
              {route.params?.product ? 'Update Product' : 'Add Product'}
            </Text>
          )}
        </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>My Store</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'product' && styles.activeTab]}
          onPress={() => setActiveTab('product')}
        >
          <Text style={[styles.tabText, activeTab === 'product' && styles.activeTabText]}>
            Add Product
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'store' && styles.activeTab]}
          onPress={() => setActiveTab('store')}
        >
          <Text style={[styles.tabText, activeTab === 'store' && styles.activeTabText]}>
            Store Setup
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'product' ? renderAddProduct() : renderStoreSetup()}
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  imagePickerText: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  addProductButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  addProductButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
});

export default VendorSetupScreen;
