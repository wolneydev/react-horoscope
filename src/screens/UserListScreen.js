import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import StorageService from '../store/store';
import EmailVerificationGuard from '../Components/emailVerification/EmailVerificationGuard';

const BASE_IMAGE_URL = 'https://api.astralmatch.life/storage/';

const UserListScreen = () => {
  const navigation = useNavigation();
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [compatibilidades, setCompatibilidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainUserPhoto, setMainUserPhoto] = useState(null);
  const [mainUserName, setMainUserName] = useState(null);

  // Controla quais janelas (pseudo-modals) estão abertas
  const [openWindows, setOpenWindows] = useState({});

  // Janela de confirmação de contato
  const [contactRequestFor, setContactRequestFor] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const resetScreen = async () => {
        try {
          setIsInitialLoading(true);
          setCurrentStep(0);
          
          const hasCompletedOnboarding = await StorageService.getSocialOnboarding();
          setIsOnboarding(!hasCompletedOnboarding);
          
          const savedUserData = await StorageService.getUserData();
          setUserData(savedUserData);
          console.log('savedUserData', savedUserData);
          fetchData();
        } catch (error) {
          console.error('Erro ao carregar dados iniciais:', error);
        } finally {
          setIsInitialLoading(false);
        }
      };

      resetScreen();
    }, [])
  );

  const fetchData = async () => {
    try {
      const token = await StorageService.getAccessToken();
      const response = await api.get('astralmapusers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        const { compatibilidades = [], main_user_profile_photo } = response.data.data;
        setCompatibilidades(compatibilidades);

        if (!main_user_profile_photo && compatibilidades.length > 0) {
          setMainUserPhoto(compatibilidades[0].main_user_profile_photo);
        } else {
          setMainUserPhoto(main_user_profile_photo);
        }

        if (compatibilidades[0]?.main_user_name) {
          setMainUserName(compatibilidades[0].main_user_name);
        }

        // Marca todos como abertos
        const allOpen = {};
        compatibilidades.forEach((_, idx) => {
          allOpen[idx] = true;
        });
        setOpenWindows(allOpen);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onboardingSteps = [
    {
      title: "Bem-vindo ao Social!",
      description: "Aqui você pode encontrar pessoas com compatibilidade astral e fazer novas conexões baseadas em seus mapas astrais.",
      icon: "people",
      action: null
    },
    {
      title: "Complete seu Perfil",
      description: "Para começar, precisamos que você complete seu perfil com foto e pelo menos uma informação de contato. Não exibiremos seu contato a ninguém, a menos que você decida compartilhá-lo.",
      icon: "person",
      action: () => navigation.navigate('HomeScreen', { 
        screen: 'Personalizar Perfil', 
      })
    },
    {
      title: "Compatibilidade Astral",
      description: "Veja a porcentagem de compatibilidade com outros usuários baseada nos seus mapas astrais.",
      icon: "stars",
      action: null
    },
    {
      title: "Solicite Contatos",
      description: "Quando encontrar alguém interessante, você pode solicitar contato. A pessoa receberá sua solicitação e poderá compartilhar as informações de contato que desejar.",
      icon: "connect-without-contact",
      action: null
    }
  ];

  const handleNextStep = async () => {
    if (currentStep === onboardingSteps.length - 1) {
      // Primeiro esconde o onboarding imediatamente
      setIsOnboarding(false);
      
      // Depois salva no storage em background
      StorageService.setSocialOnboarding(true);
      
      // Atualiza os dados da tela principal
      fetchData();
      
      // Se precisar completar o perfil, navega depois que a tela principal já estiver visível
      if (!userData?.profile_photo || !userData?.contacts?.length) {
        navigation.navigate('HomeScreen', { 
          screen: 'Personalizar Perfil',          
        });        
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleActionButton = () => {
    const currentAction = onboardingSteps[currentStep].action;
    if (currentAction) {
      currentAction();
    }
  };

  const getCompatibilityColor = (value) => {
    if (!value) return '#bbb';
    if (value < 70) return 'red';
    if (value < 80) return 'yellow';
    return 'green';
  };

  // Fecha a janela de um usuário
  const closeWindow = (index) => {
    setOpenWindows((prev) => ({ ...prev, [index]: false }));
  };

  // Confirma a solicitação de contato
  const confirmContactRequest = (index) => {
    console.log('Confirmando contato do usuário índice:', index);
    // Aqui poderia chamar uma API, etc.
    setContactRequestFor(null);
  };

  const resetOnboarding = async () => {
    try {
      await StorageService.setSocialOnboarding(false);
      setIsOnboarding(true);
      setCurrentStep(0);
    } catch (error) {
      console.error('Erro ao resetar onboarding:', error);
    }
  };

  return (
    <EmailVerificationGuard>
      {isInitialLoading ? (
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#6D44FF" />
        </View>
      ) : isOnboarding ? (
        // Tela de Onboarding
        <View style={styles.onboardingContainer}>
          <Icon 
            name={onboardingSteps[currentStep].icon} 
            size={80} 
            color="#6D44FF" 
          />
          
          <Text style={styles.onboardingTitle}>
            {onboardingSteps[currentStep].title}
          </Text>
          
          <Text style={styles.onboardingDescription}>
            {onboardingSteps[currentStep].description}
          </Text>

          <View style={styles.stepsIndicator}>
            {onboardingSteps.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.stepDot,
                  currentStep === index && styles.stepDotActive
                ]} 
              />
            ))}
          </View>

          <View style={styles.onboardingButtons}>
            {onboardingSteps[currentStep].action && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleActionButton}
              >
                <Text style={styles.actionButtonText}>
                  Completar Perfil
                </Text>
              </TouchableOpacity>
            )}

            {(currentStep !== 1 || userData?.has_profile_photo) && (
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNextStep}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === onboardingSteps.length - 1 ? 'Começar' : 'Próximo'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        // Tela Principal
        <View style={styles.container}>
          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={resetOnboarding}
            >
              <Icon name="bug-report" size={24} color="#6D44FF" />
            </TouchableOpacity>
            
            {/* Cartão do usuário principal */}
            <TouchableOpacity
              style={styles.infoCard}
              onPress={() => navigation.navigate('EditProfileScreen')}
            >
              <View style={styles.infoCardHeader}>
                {mainUserPhoto ? (
                  <Image
                    source={{ uri: `${BASE_IMAGE_URL}${mainUserPhoto}` }}
                    style={styles.infoCardPhoto}
                  />
                ) : (
                  <Icon name="person" size={60} color="#fff" />
                )}
                <View style={styles.titleContainer}>
                  <Text style={styles.infoCardTitle}>{mainUserName || 'Social'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={() => navigation.navigate('EditProfileScreen')}
                >
                  <Icon name="edit" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.infoCardDescription}>
                Explicação da conexão astral: Combinação em relação à compatibilidade de signos
                do mapa astral, mas não é uma Combinação da Sinastria (análise mais profunda).
              </Text>
            </TouchableOpacity>

            {isLoading ? (
              <ActivityIndicator color="#6D44FF" size="large" />
            ) : (
              <>
                {/* Cria uma "tela cheia" para cada compatibilidade */}
                {compatibilidades.map((user, index) => {
                  const isOpen = openWindows[index];
                  if (!isOpen) return null;

                  const compatibilidadeFormatada = user.compatibilidade_media?.toFixed(2);

                  return (
                    <View key={index} style={styles.fullScreenOverlay}>
                      {/* Conteúdo do "modal" em tela cheia */}
                      <View style={styles.fullScreenContainer}>
                        {/* Metade superior -> Foto expandida */}
                        <View style={styles.topHalf}>
                          {user.user_photo_url ? (
                            <Image
                              source={{ uri: `${BASE_IMAGE_URL}${user.user_photo_url}` }}
                              style={styles.topImage}
                            />
                          ) : (
                            <View style={styles.fallbackContainer}>
                              <Icon name="person" size={48} color="#6D44FF" />
                              <Text style={{ color: '#fff', marginTop: 6 }}>
                                Sem foto
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Metade inferior -> ScrollView com infos e botões */}
                        <View style={styles.bottomHalf}>
                          <ScrollView contentContainerStyle={styles.bottomScroll}>
                            <Text style={styles.userModalName}>{user.nome_usuario}</Text>

                            <Text
                              style={[
                                styles.userModalCompatibility,
                                { color: getCompatibilityColor(user.compatibilidade_media) }
                              ]}
                            >
                              Conexão Astral: {compatibilidadeFormatada}%
                            </Text>

                            <Text style={styles.userModalDetails}>
                              Aqui você pode colocar detalhes adicionais do usuário{' '}
                              {user.nome_usuario}, como descrição, signo, ascendente, etc.
                            </Text>

                            <View style={styles.buttonsRow}>
                              <TouchableOpacity
                                style={styles.roundButton}
                                onPress={() => closeWindow(index)}
                              >
                                <Icon name="close" size={24} color="#fff" />
                              </TouchableOpacity>

                              <View style={{ width: 40 }} />

                              <TouchableOpacity
                                style={styles.roundButton}
                                onPress={() => setContactRequestFor(index)}
                              >
                                <Icon name="phone" size={24} color="#fff" />
                              </TouchableOpacity>
                            </View>
                          </ScrollView>
                        </View>
                      </View>

                      {/* Janela de confirmação para solicitação de contato */}
                      {contactRequestFor === index && (
                        <View style={styles.confirmOverlay}>
                          <View style={styles.confirmContainer}>
                            <Text style={styles.confirmTitle}>Solicitar Contato</Text>
                            <Text style={styles.confirmText}>
                              Deseja solicitar o contato de {user.nome_usuario}?
                            </Text>

                            <View style={styles.confirmButtons}>
                              <TouchableOpacity
                                style={[styles.modalButton, { marginRight: 10 }]}
                                onPress={() => setContactRequestFor(null)}
                              >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => confirmContactRequest(index)}
                              >
                                <Text style={styles.modalButtonText}>Enviar</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </View>
      )}
    </EmailVerificationGuard>
  );
};

export default UserListScreen;

const styles = StyleSheet.create({
  /* Layout base */
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  /* Cartão do usuário principal */
  infoCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.15)',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoCardPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCardDescription: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 5,
  },
  changePhotoButton: {
    padding: 6,
    backgroundColor: '#6D44FF',
    borderRadius: 8,
    marginLeft: 8,
  },

  /* "Full screen" pseudo-modal */
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 9999, // fica na frente do conteúdo
    backgroundColor: '#000', // pode ser transparente, se quiser ver atrás
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#141527',
  },
  /* Metade superior -> foto */
  topHalf: {
    flex: 1, // metade superior
    backgroundColor: '#222',
    overflow: 'hidden',
  },
  topImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Metade inferior -> conteúdo, rolagem */
  bottomHalf: {
    flex: 1, // metade inferior
    backgroundColor: '#141527',
  },
  bottomScroll: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  userModalName: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 10,
  },
  userModalCompatibility: {
    fontSize: 16,
    marginTop: 8,
  },
  userModalDetails: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  roundButton: {
    backgroundColor: '#6D44FF',
    width: 90,
    height: 100,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Confirmação de solicitação de contato */
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmContainer: {
    backgroundColor: '#141527',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 22,
    color: '#FFD700',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    backgroundColor: 'rgba(109, 68, 255, 0.3)',
    borderColor: 'rgba(109, 68, 255, 0.6)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  onboardingContainer: {
    flex: 1,
    backgroundColor: '#141527',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  onboardingTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'center',
  },
  onboardingDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  stepsIndicator: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(109, 68, 255, 0.3)',
    marginHorizontal: 5,
  },
  stepDotActive: {
    backgroundColor: '#6D44FF',
  },
  onboardingButtons: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#6D44FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 99999,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6D44FF',
  },
});
