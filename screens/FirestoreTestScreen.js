import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getStoreByUserId, getProductsByStoreId } from '../utils/firestoreHelpers';

const FirestoreTestScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storeDoc, setStoreDoc] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const runTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('='.repeat(60));
      console.log('FIRESTORE SYNC TEST');
      console.log('='.repeat(60));
      
      // 1. Print current authenticated user UID
      if (!user?.uid) {
        throw new Error('No authenticated user found. Please log in first.');
      }
      
      console.log('\n1. CURRENT AUTHENTICATED USER UID:');
      console.log('   UID:', user.uid);
      console.log('   Email:', user.email);
      console.log('   Display Name:', user.displayName);
      
      // 2. Fetch store document from Firestore
      console.log('\n2. FETCHING STORE DOCUMENT FROM FIRESTORE:');
      console.log('   Path: stores/' + user.uid);
      
      const store = await getStoreByUserId(user.uid);
      
      if (!store) {
        console.log('   ❌ NO STORE DOCUMENT FOUND');
        console.log('   The document stores/' + user.uid + ' does not exist.');
        setStoreDoc(null);
      } else {
        console.log('   ✅ STORE DOCUMENT FOUND');
        console.log('\n   FULL DOCUMENT DATA:');
        console.log(JSON.stringify(store, null, 2));
        
        // Check required fields
        console.log('\n   REQUIRED FIELDS CHECK:');
        console.log('   • storeName:', store.storeName ? '✅ ' + store.storeName : '❌ MISSING');
        console.log('   • username:', store.username ? '✅ ' + store.username : '❌ MISSING');
        console.log('   • bannerImage:', store.bannerImage ? '✅ Present' : '❌ MISSING');
        console.log('   • whatsappNumber:', store.whatsappNumber ? '✅ ' + store.whatsappNumber : '❌ MISSING');
        console.log('   • storeRating:', store.storeRating !== undefined ? '✅ ' + store.storeRating : '❌ MISSING');
        console.log('   • storeRatingCount:', store.storeRatingCount !== undefined ? '✅ ' + store.storeRatingCount : '❌ MISSING');
        console.log('   • description:', store.description ? '✅ Present' : '⚠️  Optional');
        console.log('   • logo:', store.logo ? '✅ Present' : '⚠️  Optional');
        
        setStoreDoc(store);
      }
      
      // 3. Fetch all products
      console.log('\n3. FETCHING PRODUCTS FROM FIRESTORE:');
      console.log('   Query: products where storeId == ' + user.uid);
      
      const productsList = await getProductsByStoreId(user.uid);
      
      if (!productsList || productsList.length === 0) {
        console.log('   ❌ NO PRODUCTS FOUND');
        console.log('   No products exist for storeId: ' + user.uid);
        setProducts([]);
      } else {
        console.log('   ✅ FOUND ' + productsList.length + ' PRODUCT(S)');
        console.log('\n   FULL PRODUCTS LIST:');
        productsList.forEach((product, index) => {
          console.log(`\n   Product ${index + 1}:`);
          console.log(JSON.stringify(product, null, 2));
        });
        
        setProducts(productsList);
      }
      
      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('TEST SUMMARY');
      console.log('='.repeat(60));
      console.log('User UID:', user.uid);
      console.log('Store Document:', store ? '✅ EXISTS' : '❌ MISSING');
      console.log('Products Count:', productsList?.length || 0);
      
      if (store) {
        const hasRequiredFields = 
          store.storeName && 
          store.username && 
          store.whatsappNumber !== undefined;
        
        console.log('Required Fields:', hasRequiredFields ? '✅ COMPLETE' : '❌ INCOMPLETE');
        console.log('\n✅ FIRESTORE SYNC IS WORKING!');
        console.log('   → Vercel Web Store can now fetch this data');
      } else {
        console.log('\n⚠️  STORE DOCUMENT NOT FOUND');
        console.log('   → Create/save your store in the app first');
      }
      
      console.log('='.repeat(60));
      
      setLastRefresh(new Date().toLocaleString());
    } catch (err) {
      console.error('TEST ERROR:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, [user?.uid]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (navigation && navigation.canGoBack()) {
                navigation.goBack();
              } else if (navigation) {
                navigation.navigate('Welcome');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Firestore Sync Test</Text>
          <TouchableOpacity 
            style={[styles.refreshButton, loading && styles.refreshButtonDisabled]} 
            onPress={runTest}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>
              {loading ? 'Testing...' : 'Refresh Test'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#28a745" />
            <Text style={styles.loadingText}>Running Firestore test...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>❌ Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <>
            {/* User Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Authenticated User</Text>
              {user?.uid ? (
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>UID:</Text>
                  <Text style={styles.infoValue}>{user.uid}</Text>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                  <Text style={styles.infoLabel}>Display Name:</Text>
                  <Text style={styles.infoValue}>{user.displayName || 'N/A'}</Text>
                </View>
              ) : (
                <Text style={styles.warningText}>❌ No authenticated user</Text>
              )}
            </View>

            {/* Store Document */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Store Document</Text>
              <Text style={styles.pathText}>Path: stores/{user?.uid}</Text>
              
              {storeDoc ? (
                <>
                  <View style={styles.successBox}>
                    <Text style={styles.successText}>✅ Document Found</Text>
                  </View>
                  
                  <View style={styles.fieldCheck}>
                    <Text style={styles.fieldLabel}>
                      {storeDoc.storeName ? '✅' : '❌'} storeName: {storeDoc.storeName || 'MISSING'}
                    </Text>
                    <Text style={styles.fieldLabel}>
                      {storeDoc.username ? '✅' : '❌'} username: {storeDoc.username || 'MISSING'}
                    </Text>
                    <Text style={styles.fieldLabel}>
                      {storeDoc.bannerImage ? '✅' : '❌'} bannerImage: {storeDoc.bannerImage ? 'Present' : 'MISSING'}
                    </Text>
                    <Text style={styles.fieldLabel}>
                      {storeDoc.whatsappNumber !== undefined ? '✅' : '❌'} whatsappNumber: {storeDoc.whatsappNumber || 'MISSING'}
                    </Text>
                    <Text style={styles.fieldLabel}>
                      {storeDoc.storeRating !== undefined ? '✅' : '❌'} storeRating: {storeDoc.storeRating || 0}
                    </Text>
                    <Text style={styles.fieldLabel}>
                      {storeDoc.storeRatingCount !== undefined ? '✅' : '❌'} storeRatingCount: {storeDoc.storeRatingCount || 0}
                    </Text>
                  </View>

                  <View style={styles.jsonContainer}>
                    <Text style={styles.jsonTitle}>Full Document:</Text>
                    <Text style={styles.jsonText}>
                      {JSON.stringify(storeDoc, null, 2)}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>❌ Document Not Found</Text>
                  <Text style={styles.warningText}>
                    The document stores/{user?.uid} does not exist in Firestore.
                  </Text>
                </View>
              )}
            </View>

            {/* Products */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Products</Text>
              <Text style={styles.pathText}>Query: products where storeId == {user?.uid}</Text>
              
              {products.length > 0 ? (
                <>
                  <View style={styles.successBox}>
                    <Text style={styles.successText}>✅ Found {products.length} product(s)</Text>
                  </View>
                  
                  {products.map((product, index) => (
                    <View key={product.id || index} style={styles.productCard}>
                      <Text style={styles.productTitle}>Product {index + 1}</Text>
                      <View style={styles.jsonContainer}>
                        <Text style={styles.jsonText}>
                          {JSON.stringify(product, null, 2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>⚠️ No Products Found</Text>
                  <Text style={styles.warningText}>
                    No products exist for storeId: {user?.uid}
                  </Text>
                </View>
              )}
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Summary</Text>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>
                  Store Document: {storeDoc ? '✅ EXISTS' : '❌ MISSING'}
                </Text>
                <Text style={styles.summaryText}>
                  Products: {products.length} found
                </Text>
                {storeDoc && (
                  <Text style={styles.summaryText}>
                    Required Fields: {
                      (storeDoc.storeName && storeDoc.username && storeDoc.whatsappNumber !== undefined)
                        ? '✅ COMPLETE' 
                        : '❌ INCOMPLETE'
                    }
                  </Text>
                )}
                {storeDoc && (
                  <View style={styles.successBox}>
                    <Text style={styles.successText}>
                      ✅ FIRESTORE SYNC IS WORKING!
                    </Text>
                    <Text style={styles.successSubtext}>
                      Vercel Web Store can now fetch this data
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {lastRefresh && (
              <Text style={styles.lastRefresh}>
                Last refreshed: {lastRefresh}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
  },
  refreshButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pathText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  successBox: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  successText: {
    color: '#155724',
    fontWeight: '600',
  },
  successSubtext: {
    color: '#155724',
    fontSize: 12,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 6,
  },
  errorText: {
    color: '#721c24',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 6,
  },
  warningText: {
    color: '#856404',
  },
  fieldCheck: {
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  jsonContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  jsonTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  jsonText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#333',
  },
  productCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  lastRefresh: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 8,
  },
});

export default FirestoreTestScreen;

