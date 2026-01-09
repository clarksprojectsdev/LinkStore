import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReportSeller = ({ storeId, onReportSubmit }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    { id: 'fraud', label: 'Fraud or Scam', icon: 'warning' },
    { id: 'fake-product', label: 'Fake Product', icon: 'copy-outline' },
    { id: 'harassment', label: 'Harassment', icon: 'person-remove' },
    { id: 'spam', label: 'Spam or Misleading', icon: 'mail-unread' },
    { id: 'inappropriate', label: 'Inappropriate Content', icon: 'eye-off' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
  ];

  const handleReasonSelect = (reasonId) => {
    setSelectedReason(reasonId);
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert('Reason Required', 'Please select a reason for reporting this store.');
      return;
    }

    if (additionalDetails.trim().length < 10) {
      Alert.alert(
        'Details Required', 
        'Please provide more details (at least 10 characters) to help us investigate.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const report = {
        id: Date.now().toString(),
        storeId: storeId,
        reason: selectedReason,
        details: additionalDetails.trim(),
        date: new Date().toISOString(),
        status: 'pending'
      };

      await onReportSubmit(report);

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will investigate this matter and take appropriate action if necessary.',
        [{ text: 'OK', onPress: () => setShowReportModal(false) }]
      );

      // Reset form
      setSelectedReason('');
      setAdditionalDetails('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReportModal = () => (
    <Modal
      visible={showReportModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowReportModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.headerContent}>
            <Ionicons name="flag" size={24} color="#dc3545" />
            <Text style={styles.modalTitle}>Report Store</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowReportModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalDescription}>
            Help us keep LinkStore safe by reporting stores that violate our community guidelines.
          </Text>

          <View style={styles.reasonSection}>
            <Text style={styles.sectionTitle}>What's the issue?</Text>
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.id && styles.reasonOptionSelected
                ]}
                onPress={() => handleReasonSelect(reason.id)}
              >
                <View style={styles.reasonContent}>
                  <Ionicons 
                    name={reason.icon} 
                    size={20} 
                    color={selectedReason === reason.id ? '#fff' : '#666'} 
                  />
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason.id && styles.reasonTextSelected
                  ]}>
                    {reason.label}
                  </Text>
                </View>
                {selectedReason === reason.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <Text style={styles.detailsLabel}>
              Please provide specific details about the issue (minimum 10 characters):
            </Text>
            <TextInput
              style={styles.detailsInput}
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
              placeholder="Describe what happened, include any relevant information..."
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {additionalDetails.length}/1000 characters
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={20} color="#ffc107" />
            <Text style={styles.warningText}>
              False reports may result in account restrictions. Please only report genuine violations.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowReportModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedReason || additionalDetails.trim().length < 10 || isSubmitting) && 
              styles.submitButtonDisabled
            ]}
            onPress={handleSubmitReport}
            disabled={!selectedReason || additionalDetails.trim().length < 10 || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => setShowReportModal(true)}
      >
        <Ionicons name="flag" size={20} color="#dc3545" />
      </TouchableOpacity>

      {renderReportModal()}
    </>
  );
};

const styles = StyleSheet.create({
  reportButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#dc3545',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  reasonSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  reasonOptionSelected: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  reasonTextSelected: {
    color: '#fff',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f8f9fa',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportSeller;
