import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import LoadingOverlay from '../Components/LoadingOverlay';
import StorageService from '../store/store';
import { useMemo } from 'react';
import api from '../services/api';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';
import EmailVerificationCard from '../Components/emailVerification/EmailVerificationCard';
import EmailVerifiedCard from '../Components/emailVerification/EmailVerifiedCard';
import ScreenMenuItemCard from '../Components/ScreenMenuItemCard';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const autoCheckIntervalRef = useRef(null);
  const [canResendEmail, setCanResendEmail] = useState(false);
  const [resendCounter, setResendCounter] = useState(60);
  const counterIntervalRef = useRef(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const startShake = () => {
    console.log('Iniciando animação de shake no HomeScreen');
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

  const handleCardPress = async (screenName) => {
    if (!userData?.email_verified_at) {
      startShake();
      return;
    }

    try {
      //setIsLoading(true);
      const myAstralMap = await StorageService.getMyAstralMap();

      if (myAstralMap) {
        navigation.navigate('HomeScreen', { 
          screen: screenName, 
          params: { astralMap: myAstralMap } 
        });
      } else {
        console.error('Mapa astral não encontrado');
        // Opcional: adicionar feedback visual para o usuário
      }
    } catch (error) {
      console.error('Erro ao carregar mapa astral:', error);
      // Opcional: adicionar feedback visual para o usuário
    }
  };

  const handleVerifyEmail = async () => {
    if (!canResendEmail) return;

    try {
      setIsLoading(true);
      setLoadingMessage('Reenviando email de verificação...');
      
      const token = await StorageService.getAccessToken();
      
      await api.post('auth/resend-email-verification', { uuid: userData.uuid }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Simula um pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingMessage('Email reenviado com sucesso!');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reinicia o contador
      startResendCounter();
      
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      Alert.alert(
        'Erro',
        'Não foi possível reenviar o email de verificação.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
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

  useEffect(() => {
    // Inicia com botão desabilitado e contador
    if (!userData?.email_verified_at) {
      startResendCounter();
    }
    return () => {
      if (counterIntervalRef.current) {
        clearInterval(counterIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Se o email foi verificado, mostra o card de sucesso por alguns segundos
    if (userData?.email_verified_at) {
      setShowSuccessCard(true);
      
      // Inicia com opacidade 1
      fadeAnim.setValue(1);
      
      // Aguarda 3 segundos antes de iniciar o fade out
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000, // duração da animação em ms
          useNativeDriver: true,
        }).start(() => setShowSuccessCard(false));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [userData?.email_verified_at, fadeAnim]);

  const startResendCounter = () => {
    setCanResendEmail(false);
    setResendCounter(60);
    
    counterIntervalRef.current = setInterval(() => {
      setResendCounter((prev) => {
        if (prev <= 1) {
          clearInterval(counterIntervalRef.current);
          setCanResendEmail(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  // Função para lidar com cliques em qualquer lugar da tela
  const handleScreenPress = () => {
    if (!userData?.email_verified_at) {
      startShake();
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      style={styles.container} 
      onPress={handleScreenPress}
    >
      {memoStars}
      
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

        {/* Card de Verificação de Email */}
        {!userData?.email_verified_at ? (
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => {
              // Impede que o clique se propague para o TouchableOpacity pai
              e.stopPropagation();
              if (canResendEmail) {
                handleVerifyEmail();
              }
            }}
          >
            <EmailVerificationCard 
              userData={userData}
              canResendEmail={canResendEmail}
              resendCounter={resendCounter}
              shakeAnimation={shakeAnimation}
            />
          </TouchableOpacity>
        ) : showSuccessCard && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <EmailVerifiedCard />
          </Animated.View>
        )}

        {/* Mapa Astral Card */}
        <ScreenMenuItemCard
          title="Mapa Astral"
          description="Veja seu mapa astral completo"
          icon="arrow-forward"
          disabled={!userData?.email_verified_at}
          onPress={() => handleCardPress('Mapa Astral')}
        />


        {/* Sinastria Card */}
        <ScreenMenuItemCard
          title="Sinastria"
          description="Compare mapas astrais e descubra compatibilidades"
          icon="arrow-forward"
          disabled={!userData?.email_verified_at}
          onPress={() => handleCardPress('Sinastria')}
        />

        {/* Minha Conta Card */}
        <ScreenMenuItemCard
          title="Minha Conta"
          description="Acesse as informações de sua conta e suas configurações"
          icon="arrow-forward"
          disabled={!userData?.email_verified_at}
          onPress={() => handleCardPress('Minha Conta')}
        />

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    padding: SPACING.LARGE,
    paddingTop: SPACING.LARGE,
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
    borderColor: COLORS.PRIMARY,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.SUCCESS,
    borderWidth: 2,
    borderColor: COLORS.BACKGROUND,
  },
  userTextInfo: {
    marginLeft: SPACING.LARGE,
  },
  welcomeText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
  },
  userName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  cardsContainer: {
    padding: SPACING.LARGE,
  },
  card: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  cardTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.TINY,
  },
  cardDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
  },
  cardIcon: {
    position: 'absolute',
    right: SPACING.LARGE,
    bottom: SPACING.LARGE,
  },
  disabledCard: {
    opacity: 0.5,
  },
  warningCard: {
    ...CARD_STYLES.WARNING,
  },
  warningIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: SPACING.SMALL,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.MEDIUM,
  },
  warningCardTitle: {
    color: COLORS.WARNING,
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginTop: SPACING.MEDIUM,
  },
  warningCardDescription: {
    color: COLORS.WARNING,
    fontSize: FONTS.SIZES.MEDIUM,
    marginTop: SPACING.TINY,
    marginBottom: SPACING.MEDIUM,
    opacity: 0.8,
  },
  warningCardAction: {
    color: COLORS.WARNING,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.BOLD,
    textDecorationLine: 'underline',
    marginTop: SPACING.TINY,
  },
  successMailVerificationCard: {
    ...CARD_STYLES.SUCCESS,
    padding: SPACING.MEDIUM,
  },
  successMailVerificationCardTitle: {
    color: COLORS.SUCCESS,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  debugButton: {
    backgroundColor: COLORS.ERROR_LIGHT,
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  debugButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  debugButtonText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.BOLD,
    textAlign: 'center',
  },
  warningCardDisabled: {
    opacity: 0.7,
  },
  warningCardActionDisabled: {
    opacity: 0.5,
  },
  resendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MEDIUM,
    marginTop: SPACING.TINY,
  },  
});

export default HomeScreen;
