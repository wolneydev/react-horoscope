import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Pressable
} from 'react-native';
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
  const [userData, setUserData] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Conectando...');

  // Estado para controlar a visibilidade do Modal
  const [modalVisible, setModalVisible] = useState(false);

  // Memoize AnimatedStars para evitar re-renderização desnecessária
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
            minute: data.birth_minute,
          },
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

  // Exibe o modal ao clicar no botão
  const handleNewJourneyPress = () => {
    setModalVisible(true);
  };

  // Fecha o modal e navega para a tela de saudações
  const handleContinue = () => {
    setModalVisible(false);
    navigation.navigate('GreetingsScreen');
  };

  // Fecha o modal sem navegar
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Redireciona para Termos de Uso (e fecha o modal)
  const handleOpenTerms = () => {
    setModalVisible(false);
    navigation.navigate('TermsOfUseScreen');
  };

  // Redireciona para Política de Privacidade (e fecha o modal)
  const handleOpenPrivacy = () => {
    setModalVisible(false);
    navigation.navigate('PrivacyPolicyScreen');
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
              onPress={handleNewJourneyPress}
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

          {/* Links para termos e política */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('TermsOfUseScreen')}
              style={styles.linkWrapper}
            >
              <Text style={styles.linkText}>Termos de Uso</Text>
            </TouchableOpacity>

            <Text style={styles.linkDivider}> | </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('PrivacyPolicyScreen')}
              style={styles.linkWrapper}
            >
              <Text style={styles.linkText}>Política de Privacidade</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading && <LoadingOverlay message={loadingMessage} />}

      {/* Modal de confirmação */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>

            {/* Texto com links */}
            <Text style={styles.modalText}>
              Ao seguir você concorda com nossos{' '}
              <Text onPress={handleOpenTerms} style={styles.modalLink}>
                Termos de Uso
              </Text>{' '}
              e{' '}
              <Text onPress={handleOpenPrivacy} style={styles.modalLink}>
                Política de Privacidade
              </Text>
            </Text>

            <View style={styles.modalButtons}>
              <Pressable onPress={handleCancel} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable onPress={handleContinue} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Continuar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  /* Links de Termos e Política */
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  linkWrapper: {
    padding: 5,
  },
  linkText: {
    color: '#6D44FF',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  linkDivider: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  /* Estilos para o Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalLink: {
    color: '#6D44FF',
    textDecorationLine: 'underline',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#6D44FF',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
});

export default IndexScreen;
