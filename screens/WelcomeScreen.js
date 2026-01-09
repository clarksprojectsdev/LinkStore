import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const WelcomeScreen = ({ navigation }) => {
  const { products } = useStore();
  const { user } = useAuth();

  const handleCreateStore = () => {
    navigation.navigate('VendorSetup');
  };

  const handleViewStore = () => {
    navigation.navigate('Store');
  };

  const handleViewDashboard = () => {
    navigation.navigate('SellerDashboard');
  };

  const handleFirestoreTest = () => {
    navigation.navigate('FirestoreTest');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LinkStore</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Store Icon */}
        <View style={styles.storeIconContainer}>
          <Ionicons name="storefront" size={48} color="white" />
        </View>

        {/* Welcome Message */}
        <Text style={styles.welcomeTitle}>Welcome to LinkStore</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Create your mini store and share it with customers via WhatsApp
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.createStoreButton}
          onPress={handleCreateStore}
        >
          <Text style={styles.createStoreButtonText} numberOfLines={1} ellipsizeMode="tail">Create Your Store</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewStoreButton}
          onPress={handleViewStore}
        >
          <Text style={styles.viewStoreButtonText} numberOfLines={1} ellipsizeMode="tail">
            My Store
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={handleViewDashboard}
        >
          <Ionicons name="analytics-outline" size={20} color="#28a745" />
          <Text style={styles.dashboardButtonText} numberOfLines={1} ellipsizeMode="tail">Dashboard</Text>
        </TouchableOpacity>

        {/* Firestore Test Button - Developer Tool */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleFirestoreTest}
        >
          <Ionicons name="bug-outline" size={20} color="#007AFF" />
          <Text style={styles.testButtonText} numberOfLines={1} ellipsizeMode="tail">Firestore Test</Text>
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
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  storeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  createStoreButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 300,
    alignItems: 'center',
  },
  createStoreButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  viewStoreButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 300,
    alignItems: 'center',
  },
  viewStoreButtonText: {
    color: '#28a745',
    fontSize: 18,
    fontWeight: '600',
  },
  dashboardButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 0,
    minWidth: 300,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  dashboardButtonText: {
    color: '#28a745',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
  testButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
    minWidth: 300,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
});

export default WelcomeScreen;
