import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { COLORS, SPACING, FONTS } from '../styles/theme';

// Obtém a largura da tela
const { width } = Dimensions.get('window');
const CONTENT_WIDTH = width * 0.9; // 80% da largura da tela

const LoadingOverlay = ({ message = 'Carregando...' }) => (
  <View style={styles.overlay}>
    <View style={styles.content}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 21, 39, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    width: CONTENT_WIDTH,
    backgroundColor: COLORS.BACKGROUND_DARK,
    padding: SPACING.LARGE,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    shadowColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  spinner: {
    marginBottom: SPACING.MEDIUM,
  },
  message: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
    textAlign: 'center',
  },
});

export default LoadingOverlay;