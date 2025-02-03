import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import SpinningMandala from './SpinningMandala';

// Obtém a largura da tela
const { width } = Dimensions.get('window');
const CONTENT_WIDTH = width - 40; // 20px de padding de cada lado

const LoadingOverlay = ({ message = 'Carregando ...' }) => (
  <View style={styles.overlay}>
    <View style={styles.content}>
      <View style={styles.loadingContainer}>
        <View style={styles.mandalaContainer}>
          <SpinningMandala />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 21, 39, 0.8)',
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center',     // Centraliza horizontalmente
    zIndex: 1000,
  },
  content: {
    width: CONTENT_WIDTH,
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza os itens internos
    gap: 15,
  },
  mandalaContainer: {
    width: 30,
    height: 30,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#E0E0E0',
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoadingOverlay;