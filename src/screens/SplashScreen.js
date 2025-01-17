import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // Espera 3 segundos antes de navegar
        setTimeout(() => {
          navigation.replace('HomeScreen');
        }, 3000);
      } catch (error) {
        console.error('Erro ao verificar dados salvos:', error);
      }
    };

    checkInitialRoute();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/heart-constellation.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <Text style={styles.title}>Astral Match</Text>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    // Deixa o conteúdo (texto) centralizado
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    // sombra opcional para destacar texto em fundos claros
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default SplashScreen;
