import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import AnimatedStars from '../Components/animation/AnimatedStars';

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
      <AnimatedStars />
      <View style={styles.topSection}>
        <Text style={styles.sectionTitle}>Astral Match</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B29',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 46,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default SplashScreen;
