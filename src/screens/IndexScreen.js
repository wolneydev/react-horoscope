import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, ImageBackground, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../store/store';
import CryptoService from '../services/crypto';
import api from '../services/api';
import AnimatedStars from '../Components/animation/AnimatedStars';
import Mandala from '../Components/Mandala';
import CustomButton from '../Components/CustomButton';
import LoadingOverlay from '../Components/LoadingOverlay';

const IndexScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Conectando...');

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const savedUserData = await StorageService.getUserData();
        const isTokenValid = await StorageService.isTokenValid();
        setUserData(savedUserData);

        if (!isTokenValid && savedUserData) {
          setLoadingMessage('Autenticando ...');
          await autoLogin(savedUserData);
        }

        if (savedUserData) {
          navigation.navigate('GreetingsScreen');
        }
      } catch (error) {
        console.error('Erro ao verificar dados salvos:', error);
      } finally {
        setLoading(false);
        setLoadingMessage('Conectando ...');
      }
    };

    initializeData();
  }, []);

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

  return (
    <View style={styles.container}>
      {memoStars}
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Mandala />
          <Text style={styles.sectionTitle}>Astral Match</Text>
          <Text style={styles.sectionDescription}>
            Encontre seu par ideal com base no seu mapa astral!
          </Text>
        </View>
        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            <CustomButton 
              title="Começar uma nova jornada astral"
              onPress={() => navigation.navigate('GreetingsScreen')}
              disabled={loading}
              style={styles.customButton}
            />
            
            <CustomButton 
              title="Já tenho uma conta"
              onPress={() => navigation.navigate('LoginScreen')}
              disabled={loading}
              style={styles.customButton}
            />
          </View>
        </View>
      </View>
      {loading && <LoadingOverlay message={loadingMessage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
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
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
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
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  customButton: {
    marginVertical: 5,
  },
  welcomeText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 0,
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  loadingCard: {
    backgroundColor: '#141527',
    borderRadius: 15,
    padding: 20,
    marginTop: 50,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'white',
    elevation: 5,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  verificationContainer: {
    backgroundColor: '#141527',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#6D44FF',
  },
  verificationText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default IndexScreen;