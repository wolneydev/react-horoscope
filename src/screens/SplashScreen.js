import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import Mandala from '../Components/Mandala';
import StorageService from '../store/store';

const SplashScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const savedUserData = await StorageService.getUserData();
        const isTokenValid = await StorageService.isTokenValid();
        setUserData(savedUserData);

        let navigateTo = 'IndexScreen';
        if (!isTokenValid && savedUserData) {
          await autoLogin(savedUserData);
        } else {
          if (savedUserData) {
            navigateTo = 'HomeScreen';
          } else {
            navigateTo = 'IndexScreen';
          }
        }

        // Espera 3 segundos antes de navegar
        setTimeout(() => {
          navigation.replace(navigateTo);
        }, 3000);
      } catch (error) {
        console.error('Erro ao verificar dados salvos:', error);
      }
    };

    checkInitialRoute();
  }, [navigation]);

  const autoLogin = async (savedUserData) => {
    try {
      const decryptedPassword = CryptoService.decrypt(savedUserData.encryptedPassword);
      
      const response = await api.post('auth/login', {
        email: savedUserData.email.trim(),
        password: decryptedPassword.trim(),
      });

      const { status, data } = response.data;

      if (status === 'success') {
        const updatedUserData = {
          name: data.name,
          email: data.email,
          uuid: data.uuid,
          encryptedPassword: savedUserData.encryptedPassword,
          birthData: {
            city: data.birth_city,
            year: data.birth_year,
            month: data.birth_month,
            day: data.birth_day,
            hour: data.birth_hour,
            minute: data.birth_minute
          }
        };

        await StorageService.saveAccessToken(data.access_token);
        await StorageService.saveUserData(updatedUserData);
        await StorageService.saveAstralMap(data.astral_map);

        setUserData(updatedUserData);
      }
    } catch (error) {
      console.error('Erro no login automático:', error);
      await StorageService.clearAll();
    }
  };

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  return (
    <View style={styles.container}>
      {memoStars}
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Mandala />
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B29',
  },
  content: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 32,
    marginBottom: 10,
    color: 'white',
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sectionDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#E0E0E0',
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});

export default SplashScreen;
