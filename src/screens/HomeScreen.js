import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import SpinningMandala from '../Components/SpinningMandala';
import LoadingOverlay from '../Components/LoadingOverlay';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StorageService from '../store/store';
import { useMemo } from 'react';
import api from '../services/api';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [isDebugChecking, setIsDebugChecking] = useState(false);
  const autoCheckIntervalRef = useRef(null);

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCardPress = (screenName) => {
    if (!userData?.email_verified_at) {
      startShake();
      return;
    }
    navigation.navigate('HomeScreen', { screen: screenName });
  };

  const handleVerifyEmail = () => {
    // Implementar lógica para reenviar email de verificação
    console.log('Reenviando email de verificação...');
  };

  const debugForceVerification = async () => {
    if (isDebugChecking) return; // Evita múltiplas verificações simultâneas
    
    try {
      setIsDebugChecking(true);
      console.log('Iniciando verificação de debug...');

      const token = await StorageService.getAccessToken();
      
      // Executa verificação a cada 3 segundos por 5 vezes
      let count = 0;
      const debugInterval = setInterval(async () => {
        try {
          console.log(`Verificação ${count + 1} de 5`);
          
          // Faz requisição para verificar status do email
          const response = await api.get('users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('Resposta da API:', response.data);
          console.log('Resposta da API:', response.data.data.email_verified_at);

          if (response.data.data.email_verified_at) {
            console.log('Email verificado com sucesso!');
            
            // Atualiza dados do usuário
            const updatedUserData = {
              ...userData,
              email_verified_at: response.data.data.email_verified_at
            };
            
            await StorageService.saveUserData(updatedUserData);
            setUserData(updatedUserData);
            
            // Para a verificação
            clearInterval(debugInterval);
            setIsDebugChecking(false);
            return;
          }
          
          count++;
          if (count >= 5) {
            console.log('Limite de tentativas atingido');
            clearInterval(debugInterval);
            setIsDebugChecking(false);
          }
        } catch (error) {
          console.error('Erro na verificação:', error);
          clearInterval(debugInterval);
          setIsDebugChecking(false);
        }
      }, 3000);

    } catch (error) {
      console.error('Erro ao iniciar verificação de debug:', error);
      setIsDebugChecking(false);
    }
  };

  // Função para verificar email periodicamente
  const startEmailVerification = async () => {
    if (autoCheckIntervalRef.current) {
      clearInterval(autoCheckIntervalRef.current);
    }

    try {
      console.log('Iniciando verificação periódica...');
      const token = await StorageService.getAccessToken();
      
      autoCheckIntervalRef.current = setInterval(async () => {
        try {
          console.log('Verificando status do email...');
          
          const response = await api.get('users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('Resposta da API:', response.data.data.email_verified_at);

          if (response.data.data.email_verified_at) {
            console.log('Email verificado com sucesso!');
            
            // Atualiza dados do usuário
            const updatedUserData = {
              ...userData,
              email_verified_at: response.data.data.email_verified_at
            };
            
            await StorageService.saveUserData(updatedUserData);
            setUserData(updatedUserData);
            
            // Para a verificação
            clearInterval(autoCheckIntervalRef.current);
            autoCheckIntervalRef.current = null;
          }
        } catch (error) {
          console.error('Erro na verificação:', error);
        }
      }, 10000); // Verifica a cada 10 segundos

    } catch (error) {
      console.error('Erro ao iniciar verificação periódica:', error);
    }
  };

  // Inicia verificação quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      if (!userData?.email_verified_at) {
        startEmailVerification();
      }

      // Cleanup quando a tela perde foco
      return () => {
        if (autoCheckIntervalRef.current) {
          console.log('Parando verificação periódica...');
          clearInterval(autoCheckIntervalRef.current);
          autoCheckIntervalRef.current = null;
        }
      };
    }, [userData?.email_verified_at])
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const savedUserData = await StorageService.getUserData();
        setUserData(savedUserData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  return (
    <View style={styles.container}>
      
      {memoStars}
      {isLoading && <LoadingOverlay />}
      
      {/* Header com Avatar e Nome */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../assets/images/sign/aries.jpg')} // Adicione uma imagem padrão
              style={styles.avatar}
            />
            <View style={styles.statusDot} />
          </View>
          <View style={styles.userTextInfo}>
            <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
            <Text style={styles.userName}>{userData?.name || ''}</Text>
          </View>
        </View>
      </View>

      {/* Cards de Navegação */}
      <View style={styles.cardsContainer}>

        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          {/* Card de Verificação de Email */}
          {!userData?.email_verified_at && (
            <>
              <TouchableOpacity 
                style={styles.warningCard}
                onPress={handleVerifyEmail}
              >
                <View style={styles.warningIconContainer}>
                  <Icon name="warning" size={24} color="#FFD700" />
                </View>
                <Text style={styles.warningCardTitle}>Verifique seu Email</Text>
                <Text style={styles.warningCardDescription}>
                  Enviamos um email para {userData?.email}.
                </Text>
                <Text style={styles.warningCardDescription}>
                  Por favor, verifique sua caixa de entrada e siga as instruções para ativar sua conta.
                </Text>
                <Text style={styles.warningCardAction}>Reenviar email de verificação</Text>
                <Icon name="arrow-forward" size={24} color="#FFD700" style={styles.cardIcon} />
              </TouchableOpacity>

              {/* Botão de Debug */}
              {__DEV__ && (
                <TouchableOpacity 
                  style={[
                    styles.debugButton,
                    isDebugChecking && styles.debugButtonActive
                  ]}
                  onPress={debugForceVerification}
                  disabled={isDebugChecking}
                >
                  <Text style={styles.debugButtonText}>
                    {isDebugChecking ? 'Verificando...' : 'Debug: Testar Verificação'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Animated.View>

        {/* Card de Verificação de Email */}
        {userData?.email_verified_at && (
          <>
            <TouchableOpacity 
              style={styles.successMailVerificationCard}
            >
              <Text style={styles.successMailVerificationCardTitle}>Email Verificado!</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Mapa Astral Card */}        
        <TouchableOpacity 
          style={[
            styles.card,
            !userData?.email_verified_at && styles.disabledCard
          ]}
          onPress={() => handleCardPress('Mapa Astral')}
        >
          <Text style={styles.cardTitle}>Mapa Astral</Text>
          <Text style={styles.cardDescription}>Veja seu mapa astral completo</Text>
          <Icon name="arrow-forward" size={24} color="#6D44FF" style={styles.cardIcon} />
        </TouchableOpacity>        

        {/* Sinastria Card */}
        <TouchableOpacity 
          style={[
            styles.card,
            !userData?.email_verified_at && styles.disabledCard
          ]}
          onPress={() => handleCardPress('Sinastria')}
        >
          <Text style={styles.cardTitle}>Sinastria</Text>
          <Text style={styles.cardDescription}>Compare mapas astrais e descubra compatibilidades</Text>
          <Icon name="arrow-forward" size={24} color="#6D44FF" style={styles.cardIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  header: {
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(109, 68, 255, 0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#6D44FF',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#141527',
  },
  userTextInfo: {
    marginLeft: 15,
  },
  welcomeText: {
    color: '#7A708E',
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardDescription: {
    color: '#bbb',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  cardIcon: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  warningCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  warningIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  warningCardTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  warningCardDescription: {
    color: '#FFD700',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 10,
    opacity: 0.8,
  },
  warningCardAction: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
  successMailVerificationCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 15,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  successMailVerificationCardTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledCard: {
    opacity: 0.5,
  },
  debugButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  debugButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  debugButtonText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
