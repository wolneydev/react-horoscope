import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ImageBackground, Button, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../store/store';
import CryptoService from '../services/crypto';
import api from '../services/api';

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
      
      // Limpa os dados
      await StorageService.clearAll();
      
      setLogoutMessage('Saindo...');
      // Espera 2 segundos
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
      <ImageBackground source={require('../assets/heart-constellation.png')} style={styles.section}>
        {userData && (
          <Text style={styles.welcomeText}>Bem-vindo(a), {userData.name}!</Text>
        )}
      </ImageBackground>
      <ImageBackground source={require('../assets/images/starry-night2.jpg')} style={styles.section}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Astral Match</Text>
          <Text style={styles.sectionDescription}>
            Encontre seu par ideal com base no seu mapa astral!
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.buttonContainer}>
            {!userData ? (
              <>
                <View style={styles.buttonWrapper}>
                  <Button 
                    title="Começar uma nova jornada astral" 
                    onPress={() => navigation.navigate('GreetingsScreen')} 
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button 
                    title="Já tenho uma conta" 
                    onPress={() => navigation.navigate('LoginScreen')} 
                  />
                </View>
              </>
            ) : (
              <View>
                <View style={styles.buttonWrapper}>
                  <Button 
                    title="Ver meu mapa astral" 
                    onPress={() => navigation.navigate('AstralMapScreen')} 
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button 
                    title={loggingOut ? "Saindo..." : "Sair"}
                    onPress={handleLogout}
                    disabled={loggingOut}
                    color="#ff4444"
                  />
                </View>
                {loggingOut && (
                  <ActivityIndicator 
                    style={styles.logoutLoader} 
                    color="#FFD700" 
                    size="small" 
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  buttonWrapper: {
    marginVertical: 5,
  },
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
  sectionText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#fff',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonWrapper: {
    marginVertical: 5,
  },
  welcomeText: {
    fontSize: 20,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonStyle: {
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  },
});

export default HomeScreen;