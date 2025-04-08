import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import LoadingOverlay from '../Components/LoadingOverlay';
import StorageService from '../store/store';
import { useMemo } from 'react';
import EmailVerifiedCard from '../Components/emailVerification/EmailVerifiedCard';
import ScreenMenuItemCard from '../Components/ScreenMenuItemCard';
import EmailVerificationGuard from '../Components/emailVerification/EmailVerificationGuard';
import UserInfoHeader from '../Components/UserInfoHeader';

const MyAccountScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const counterIntervalRef = useRef(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleCardPress = async (screenName) => {

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const savedUserData = await StorageService.getUserData();
        console.log('savedUserData', savedUserData);
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
    return () => {
      if (counterIntervalRef.current) {
        clearInterval(counterIntervalRef.current);
      }
    };
  }, []);

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  return (
    <EmailVerificationGuard>
      <View style={styles.container}>
        
        {memoStars}
        {isLoading && <LoadingOverlay message={loadingMessage} />}
        
        {/* Header com Avatar e Nome */}
        <UserInfoHeader 
          userData={userData}
          showWelcome={true}
          style={styles.header}
        />

        {/* Cards de Navegação */}
        <View style={styles.cardsContainer}>

          {/* Email Verificado */}
          <EmailVerifiedCard/>
                    
          {/* Personalizar Perfil */}
          <ScreenMenuItemCard 
            title="Personalizar Perfil"
            description="Personalize seu perfil para poder se conectar com outros usuários."
            icon="arrow-forward"
            onPress={() => handleCardPress('Personalizar Perfil')}
          />

          {/* Minhas Compras */}
          <ScreenMenuItemCard 
            title="Minhas Compras"
            description="Veja os detalhes das suas compras e assinaturas."
            icon="arrow-forward"
            disabled={!userData?.email_verified_at}
            onPress={() => handleCardPress('Minhas Compras')}
          />

        </View>
      </View>
    </EmailVerificationGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
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
});

export default MyAccountScreen;
