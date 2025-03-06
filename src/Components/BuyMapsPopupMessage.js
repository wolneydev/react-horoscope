import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BuyMapsPopupMessage = ({ visible, onClose, type, title, message, errorTitle, errorMessage }) => {
  const iconProps = type === 'success' 
    ? { name: 'check-circle', color: '#4CAF50' }
    : { name: 'error', color: '#FF4444' };

  const styles = type === 'success' ? successStyles : errorStyles;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPressOut={onClose}
      >
        <View style={styles.modalContent}>
          <Icon name={iconProps.name} size={60} color={iconProps.color} style={styles.icon} />
          <Text style={styles.modalTitle}>{title}</Text>
          {errorMessage && <Text style={styles.modalErrorTitle}>{errorTitle}</Text>}
          {errorMessage && <Text style={styles.modalErrorText}>{errorMessage}</Text>}
          {message && <Text style={styles.modalText}>{message}</Text>}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const baseStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#141527',
    borderRadius: 15,
    borderWidth: 2,
    padding: 25,
    width: '80%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalErrorTitle: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalErrorText: {
    fontSize: 14,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 10,
  },
};

const successStyles = StyleSheet.create({
  ...baseStyles,
  modalContent: {
    ...baseStyles.modalContent,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
});

const errorStyles = StyleSheet.create({
  ...baseStyles,
  modalContent: {
    ...baseStyles.modalContent,
    borderColor: '#FF4444',
    shadowColor: '#FF4444',
  },
});

export default BuyMapsPopupMessage;
