import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const RateVendorModal = ({ 
  visible, 
  onClose, 
  onRate, 
  storeName = 'this vendor',
  isLoading = false 
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarPress = (rating) => {
    setSelectedRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleSubmit = () => {
    if (selectedRating === 0) {
      Alert.alert('Please Rate', 'Please select a rating before submitting.');
      return;
    }
    
    onRate(selectedRating);
    setSelectedRating(0);
    setHoveredRating(0);
  };

  const handleClose = () => {
    setSelectedRating(0);
    setHoveredRating(0);
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || selectedRating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => handleStarPress(i)}
          onPressIn={() => handleStarHover(i)}
          onPressOut={() => handleStarHover(0)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={i <= displayRating ? "star" : "star-outline"}
            size={40}
            color={i <= displayRating ? "#FFD700" : "#ddd"}
          />
        </TouchableOpacity>
      );
    }
    
    return stars;
  };

  const getRatingText = () => {
    if (selectedRating === 0) return "Tap a star to rate";
    
    const ratingTexts = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    
    return ratingTexts[selectedRating] || "";
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Rate {storeName}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.subtitle}>
                How was your experience with this store?
              </Text>
              
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              
              <Text style={styles.ratingText}>
                {getRatingText()}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Skip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.submitButton,
                  selectedRating === 0 && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isLoading || selectedRating === 0}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Submitting..." : "Submit Rating"}
                </Text>
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
    width: width * 0.9,
    maxWidth: 400,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  ratingSection: {
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  starButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    minHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default RateVendorModal;
