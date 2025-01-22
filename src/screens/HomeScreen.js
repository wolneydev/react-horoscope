import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ImageBackground, Button, ActivityIndicator, Alert, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../store/store';
import CryptoService from '../services/crypto';
import api from '../services/api';
import AnimatedStars from '../Components/animation/AnimatedStars';
import { BlurView } from '@react-native-community/blur';

const CustomButton = ({ title, onPress, color }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.buttonWrapper,
      color === '#ff4444' && { 
        backgroundColor: 'rgba(109, 68, 255, 0.15)', 
        borderColor: 'white' 
      }
    ]}
  >
    <View style={styles.buttonContent}>
      <Text style={[
        styles.buttonText,
        color === '#ff4444' && { 
          color: 'white',
          textShadowColor: '#ff4444'
        }
      ]}>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

const Divider = () => (
  <View style={styles.dividerContainer}>
    <View style={styles.dividerLine} />
    <View style={styles.dividerStar} />
    <View style={styles.dividerLine} />
  </View>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userData, setUserData] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState('');

  useEffect(() => {
    checkPersistedData();
  }, []);

  const checkPersistedData = async () => {
    try {
      const savedUserData = await StorageService.getUserData();
      const isTokenValid = await StorageService.isTokenValid();
      setUserData(savedUserData);

      if (!isTokenValid && savedUserData) {
        autoLogin(savedUserData);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao verificar dados salvos:', error);
      setLoading(false);
    }
  };
  
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

        // Salva novo token com nova data de expiração
        await StorageService.saveAccessToken(data.access_token);
        await StorageService.saveUserData(updatedUserData);
        await StorageService.saveAstralMap(data.astral_map);

        setUserData(updatedUserData);
      }
    } catch (error) {
      console.error('Erro no login automático:', error);
      // Limpa todos os dados em caso de erro
      await StorageService.clearAll();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setLogoutMessage('Finalizando sessão...');
      
      await StorageService.clearAll();
      
      setLogoutMessage('Saindo...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUserData(null);

    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
    } finally {
      setLogoutMessage('');
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Conectando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Astral Combination</Text>
        <Text style={styles.sectionDescription}>
          Encontre seu par ideal com base no seu mapa astral!
        </Text>
      </View>
      <AnimatedStars />
      <View style={styles.section}>
        {userData && (
          <Text style={styles.welcomeText}>Bem-vindo(a), {userData.name}!</Text>
        )}
        <View style={styles.buttonContainer}>
          {!userData ? (
            <>
              <CustomButton 
                title="Começar uma nova jornada astral" 
                onPress={() => navigation.navigate('GreetingsScreen')} 
              />
              <CustomButton 
                title="Já tenho uma conta" 
                onPress={() => navigation.navigate('LoginScreen')} 
              />
            </>
          ) : (
            <View>
              <CustomButton 
                title="Ver meu mapa astral" 
                onPress={() => navigation.navigate('AstralMapScreen')} 
              />
              <CustomButton 
                title={loggingOut ? "Saindo..." : "Sair"}
                onPress={handleLogout}
                disabled={loggingOut}
                color="#ff4444"
              />
            </View>
          )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1B29',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 10,
    fontSize: 16,
  },
  logoutLoader: {
    marginTop: 10,
  },
  section: {
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
  sectionDescription: {
    fontSize: 18,
    textAlign: 'center',
    color: '#E0E0E0',
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonWrapper: {
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(109, 68, 255, 0.15)', 
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
  },
  buttonContent: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  dividerStar: {
    width: 8,
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    marginHorizontal: 15,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default HomeScreen;