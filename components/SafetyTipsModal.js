import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SafetyTipsModal = ({ visible, onClose }) => {
  const handleLearnMorePress = async () => {
    const url = 'https://linkstore.framer.website/privacy-policy';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const safetyTips = [
    {
      icon: 'shield-checkmark',
      title: 'Verify Store Authenticity',
      description: 'Check store reviews and ratings before making purchases. Look for verified vendors with good feedback.',
    },
    {
      icon: 'card',
      title: 'Secure Payment Methods',
      description: 'Use secure payment methods and avoid sharing sensitive financial information through unsecured channels.',
    },
    {
      icon: 'chatbubble',
      title: 'Communicate Safely',
      description: 'Keep all communications within the platform. Be cautious of requests to move conversations to other apps.',
    },
    {
      icon: 'location',
      title: 'Meet in Safe Locations',
      description: 'If meeting in person, choose public, well-lit locations during daylight hours. Bring a friend if possible.',
    },
    {
      icon: 'document-text',
      title: 'Get Receipts',
      description: 'Always ask for receipts or proof of purchase. Keep records of all transactions and communications.',
    },
    {
      icon: 'warning',
      title: 'Trust Your Instincts',
      description: 'If something feels off or too good to be true, trust your instincts and avoid the transaction.',
    },
    {
      icon: 'lock-closed',
      title: 'Protect Personal Info',
      description: 'Never share personal information like passwords, bank details, or social security numbers.',
    },
    {
      icon: 'refresh',
      title: 'Report Suspicious Activity',
      description: 'Report any suspicious behavior or fraudulent activity to the platform administrators immediately.',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="shield-checkmark" size={24} color="#28a745" />
                <Text style={styles.title}>Safety Tips</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.subtitle}>
                Stay safe while shopping online. Follow these important safety tips:
              </Text>

              {safetyTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.tipIcon}>
                    <Ionicons name={tip.icon} size={20} color="#28a745" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                </View>
              ))}

              {/* Disclaimer */}
              <View style={styles.disclaimerSection}>
                <View style={styles.disclaimerHeader}>
                  <Ionicons name="information-circle" size={20} color="#007AFF" />
                  <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
                </View>
                <Text style={styles.disclaimerText}>
                  Disclaimer: LinkStore acts only as a facilitator and is not responsible for transactions, product quality, or delivery. Buyers and sellers are solely responsible for their interactions. Always verify before making payments.{' '}
                  <Text style={styles.learnMoreLink} onPress={handleLearnMorePress}>
                    Learn more
                  </Text>
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.gotItButton}
                onPress={onClose}
              >
                <Text style={styles.gotItButtonText}>Got it, thanks!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.95,
    maxWidth: 500,
    maxHeight: '90%',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  disclaimerSection: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontWeight: '500',
  },
  learnMoreLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  gotItButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  gotItButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SafetyTipsModal;
