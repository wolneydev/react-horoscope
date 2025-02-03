import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import SpinningMandala from '../Components/SpinningMandala';
import StorageService from '../store/store';
import LoadingOverlay from '../Components/LoadingOverlay';

const GreetingsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando ...');

  const checkUserLogin = async () => {
    try {
      const accessToken = await StorageService.getAccessToken();
      const userData = await StorageService.getUserData();
      
      if (accessToken && userData) {
        setIsLoading(true);
        setLoadingMessage('Usuário já logado. Redirecionando ...');
        // Se usuário já está logado, redireciona para home
        navigation.replace('HomeScreen');
      }
    } catch (error) {
      console.error('Erro ao verificar login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomButton = ({ title, onPress, color, disabled }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.buttonWrapper,
        color === '#ff4444' && { 
          backgroundColor: 'rgba(109, 68, 255, 0.15)', 
          borderColor: '#FFD700' 
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

  const handleNavigation = useCallback((screen) => {
    navigation.navigate(screen);
  }, [navigation]);

  useEffect(() => {
    checkUserLogin();
    const timer = setTimeout(() => {
      navigation.navigate('RegisterScreen');
    }, 4000);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [navigation]);

  // Memoize os botões
  const renderButtons = useMemo(() => {
    return (
      <>
        <CustomButton 
          title="Começar" 
          onPress={() => handleNavigation('RegisterScreen')} 
        />
      </>
    );
  }, []);

  return (
    <View style={styles.container}>
      <AnimatedStars />
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>É aqui que começa sua jornada!</Text>
        <Text style={styles.sectionDescription}>
          Vamos procurar seu par ideal com base no seu mapa astral!
        </Text>
      </View>
      <View style={styles.section30}>
        <SpinningMandala />
        <Text style={styles.sectionText}>Vamos te conhecer melhor!</Text>

        <View style={styles.buttonContainer}>
          {renderButtons}
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
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 20,
  },
  section30: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 32,
    marginBottom: 10,
    textAlign: 'center', 
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
  sectionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#E0E0E0',
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    marginBottom: 20,
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
    fontSize: 14,
    letterSpacing: 0.5,
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default GreetingsScreen;