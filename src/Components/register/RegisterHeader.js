import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RegisterHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>
        Precisamos de alguns dados para criar seu mapa astral!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#E0E0E0',
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});

export default RegisterHeader;
