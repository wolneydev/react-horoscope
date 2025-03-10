import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../../styles/theme';

const EmailVerifiedCard = ({ style }) => {
  return (
    <TouchableOpacity style={[styles.successMailVerificationCard, style]}>
      <Text style={styles.successMailVerificationCardTitle}>Email Verificado!</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  successMailVerificationCard: {
    ...CARD_STYLES.SUCCESS,
    padding: SPACING.MEDIUM,
  },
  successMailVerificationCardTitle: {
    color: COLORS.SUCCESS,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
});

export default EmailVerifiedCard; 