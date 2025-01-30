import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import SpinningMandala from './SpinningMandala';

// Obtém a largura da tela
const { width } = Dimensions.get('window');
const CONTENT_WIDTH = width - 40; // 20px de padding de cada lado

const LoadingOverlay = ({ message = 'Carregando ...' }) => (
  <View style={styles.overlay}>
    <View style={styles.content}>
      <SpinningMandala />
      <Text style={styles.message}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 21, 39, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20, // Padding nas laterais
  },
  content: {
    width: CONTENT_WIDTH, // Largura fixa
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
  },
  message: {
    color: '#E0E0E0',
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',    
  },
});

export default LoadingOverlay;