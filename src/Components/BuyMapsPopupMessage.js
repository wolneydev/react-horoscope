import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, FONTS, SHADOWS } from '../styles/theme';

const BuyMapsPopupMessage = ({ 
  visible, 
  onClose, 
  type = 'success', 
  title, 
  message,
  errorTitle,
  errorMessage
}) => {
  const isSuccess = type === 'success';
  
  const iconName = isSuccess ? 'check-circle' : 'error';
  const iconColor = isSuccess ? COLORS.SUCCESS : COLORS.ERROR;
  const borderColor = isSuccess ? COLORS.SUCCESS : COLORS.ERROR;
  const shadowColor = isSuccess ? COLORS.SUCCESS : COLORS.ERROR;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { borderColor, shadowColor }
        ]}>
          <Icon name={iconName} size={60} color={iconColor} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          {errorTitle && errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>{errorTitle}</Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          )}
          
          {onClose && (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  modalContent: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 15,
    padding: SPACING.XLARGE,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.MEDIUM,
    elevation: 10,
  },
  icon: {
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontSize: FONTS.SIZES.XXLARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  message: {
    fontSize: FONTS.SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    width: '100%',
    marginBottom: SPACING.LARGE,
  },
  errorTitle: {
    fontSize: FONTS.SIZES.SMALL,
    color: COLORS.ERROR,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.TINY,
  },
  errorMessage: {
    fontSize: FONTS.SIZES.SMALL,
    color: COLORS.ERROR,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.XLARGE,
    borderRadius: 8,
  },
  closeButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
  },
});

export default BuyMapsPopupMessage;
