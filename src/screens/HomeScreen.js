import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, ImageBackground, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../store/store';
import CryptoService from '../services/crypto';
import api from '../services/api';
import AnimatedStars from '../Components/animation/AnimatedStars';

const CustomButton = ({ title, onPress, color, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.buttonWrapper,
      color === '#ff4444' && { 
        backgroundColor: 'rgba(109, 68, 255, 0.15)', 
        borderColor: 'white' 
      },
      disabled && { opacity: 0.5 }
    ]}
    disabled={disabled}
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

const CustomBlackButton = ({ title, onPress, color, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.buttonWrapper,
      color === '#ff4444' && { 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderColor: 'white' 
      },
      disabled && { opacity: 0.5 }
    ]}
    disabled={disabled}
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

const HomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Conectando...');
  const [logoutMessage, setLogoutMessage] = useState('');

  // Memoize AnimatedStars para evitar re-renderização
  const memoizedStars = useMemo(() => <AnimatedStars />, []);

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
      } catch (error) {
        console.error('Erro ao verificar dados salvos:', error);
      } finally {
        setLoading(false);
        setLoadingMessage('Conectando ...');
      }
    };

    initializeData();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setLoadingMessage('Finalizando sessão...');
      setLoading(true);
      await StorageService.clearAll();
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUserData(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
    } finally {
      setLoading(false);
      setLoggingOut(false);
      setLoadingMessage('Conectando...');
    }
  }, []);

  const handleNavigation = useCallback((screen) => {
    navigation.navigate(screen);
  }, [navigation]);

  const fetchUserData = useCallback(async () => {
    try {
      setLoadingMessage('Atualizando dados...');
      setLoading(true);
      const response = await api.get('user/me');
      
      if (response.data.status === 'success') {
        const updatedUserData = {
          ...userData,
          isEmailVerified: response.data.data.is_email_verified
        };
        await StorageService.saveUserData(updatedUserData);
        setUserData(updatedUserData);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
    } finally {
      setLoading(false);
      setLoadingMessage('Conectando...');
    }
  }, [userData]);

  // Memoize os botões
  const renderButtons = useMemo(() => {
    if (!userData) {
      return (
        <>
          <CustomButton 
            title="Começar uma nova jornada astral" 
            onPress={() => handleNavigation('GreetingsScreen')} 
            disabled={loading}
          />
          <CustomButton 
            title="Já tenho uma conta" 
            onPress={() => handleNavigation('LoginScreen')} 
            disabled={loading}
          />          
        </>
      );
    }

    return (
      <View>
        {!userData.isEmailVerified && (
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationText}>
              Enviamos um e-mail para {userData.email}. Verifique seu e-mail siga as instruções para ativar sua conta.
            </Text>
            <CustomButton 
              title="Atualizar dados" 
              onPress={fetchUserData}
              disabled={loading}
              color="#6D44FF"
            />
          </View>
        )}
        <CustomButton 
          title="Ver meu mapa astral" 
          onPress={() => handleNavigation('AstralMapScreen')} 
          disabled={loading || !userData.isEmailVerified}
        />
        <CustomButton 
          title="Analisar compatibilidade astral" 
          onPress={() => handleNavigation('AstralMapScreen')} 
          disabled={loading || !userData.isEmailVerified}
        />        
        <CustomBlackButton 
          title={loggingOut ? "Saindo..." : "Sair"}
          onPress={() => handleLogout()}
          disabled={loading || loggingOut}
          color="#ff4444"
        />
      </View>
    );
  }, [userData, loading, loggingOut, handleNavigation, handleLogout, fetchUserData]);

  // Memoize o loading overlay
  const loadingOverlay = useMemo(() => {
    if (!loading) return null;
    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        </View>
      </View>
    );
  }, [loading, loadingMessage]);

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
      {memoizedStars}
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.sectionTitle}>Astral Match</Text>
          <Text style={styles.sectionDescription}>
            Encontre seu par ideal com base no seu mapa astral!
          </Text>
        </View>

        {userData && (
          <Text style={styles.welcomeText}>Bem-vindo(a), {userData.name}!</Text>
        )}

        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            {renderButtons}
          </View>
        </View>
      </View>

      {loadingOverlay}
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
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 27, 41, 0.3)',
  },
  loadingCard: {
    backgroundColor: 'rgba(30, 27, 41, 0.85)',
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
  debugButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'red',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
  },
  verificationContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.15)',
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

export default HomeScreen;