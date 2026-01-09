import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const SellerDashboardScreen = ({ navigation }) => {
  const { analytics, refreshAnalytics, isLoading } = useStore();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshAnalytics();
      Alert.alert('Success', 'Analytics refreshed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh analytics. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, icon, color = '#28a745' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={refreshing ? "#ccc" : "#28a745"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, {user?.displayName || 'Vendor'}!</Text>
          <Text style={styles.welcomeSubtitle}>
            Here's how your store is performing
          </Text>
        </View>

        {/* Analytics Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Products"
            value={analytics.totalProducts}
            icon="cube-outline"
            color="#007bff"
          />
          
          <StatCard
            title="Total Clicks"
            value={analytics.totalClicks.toLocaleString()}
            icon="eye-outline"
            color="#17a2b8"
          />
          
          <StatCard
            title="Total Orders"
            value={analytics.totalOrders.toLocaleString()}
            icon="bag-outline"
            color="#ffc107"
          />
          
          <StatCard
            title="Conversion Rate"
            value={`${analytics.conversionRate}%`}
            icon="trending-up-outline"
            color="#28a745"
          />
        </View>

        {/* Performance Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          
          <View style={styles.insightCard}>
            <Ionicons name="analytics-outline" size={20} color="#666" />
            <Text style={styles.insightText}>
              {analytics.totalClicks > 0 
                ? `Your products have been viewed ${analytics.totalClicks} times`
                : 'No product views yet. Share your store to get started!'
              }
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#666" />
            <Text style={styles.insightText}>
              {analytics.totalOrders > 0
                ? `You've received ${analytics.totalOrders} orders through WhatsApp`
                : 'No orders yet. Make sure your WhatsApp number is set up!'
              }
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Ionicons name="trending-up-outline" size={20} color="#666" />
            <Text style={styles.insightText}>
              {analytics.conversionRate > 0
                ? `Your conversion rate is ${analytics.conversionRate}% - ${analytics.conversionRate >= 10 ? 'Great job!' : 'Keep improving!'}`
                : 'Start tracking your performance by sharing your store!'
              }
            </Text>
          </View>
        </View>

        {/* Last Updated */}
        <View style={styles.lastUpdatedSection}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Store')}
          >
            <Ionicons name="storefront-outline" size={20} color="#28a745" />
            <Text style={styles.actionButtonText}>View My Store</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('VendorSetup')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#007bff" />
            <Text style={styles.actionButtonText}>Add Products</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  insightsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  lastUpdatedSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
});

export default SellerDashboardScreen;
