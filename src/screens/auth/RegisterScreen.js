// src/screens/auth/register/RegisterScreen.js

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  PermissionsAndroid
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service'; // <--- IMPORTAÇÃO DA BIBLIOTECA NATIVA
import api from '../../services/api';
import StorageService from '../../store/store';
import CryptoService from '../../services/crypto';
import AnimatedStars from '../../Components/animation/AnimatedStars';
import LoadingOverlay from '../../Components/LoadingOverlay';
import CustomButton from '../../Components/CustomButton';
import CityAutoComplete from '../../Components/CityAutoComplete';
import ErrorNotification from '../../Components/ErrorNotification';
import CustomInput from '../../Components/CustomInput';
import CustomDateTimePicker from '../../Components/CustomDateTimePicker';

export default function RegisterScreen({ navigation }) {
  // Inputs de texto
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');

  // Cidade de nascimento (via AutoComplete)
  const [birthCity, setBirthCity] = useState('');
  const [birthLatitude, setBirthLatitude] = useState('');
  const [birthLongitude, setBirthLongitude] = useState('');

  // Localização atual do usuário
  const [currentLatitude, setCurrentLatitude] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('');

  // Data e hora de nascimento
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());

  // Estados de UI
  const [errors, setErrors] = useState({
    nome: '',
    city: '',
    birthDate: '',
    birthTime: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando ...');

  // Estado para a notificação de erro
  const [errorNotification, setErrorNotification] = useState({
    visible: false,
    message: ''
  });

  // Animação
  const memoStars = useMemo(() => <AnimatedStars />, []);

  useEffect(() => {
    checkUserLogin();
    requestLocationAsync(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkUserLogin();
    }, [])
  );

  /**
   * Solicita a permissão de localização e, se concedida, obtém a localização atual usando
   * react-native-geolocation-service.
   */
  const requestLocationAsync = async () => {
    try {
      // Verifica se estamos em Android e solicitamos permissão (no iOS costuma ser automático).
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permissão negada', 'Não foi possível obter sua localização!');
        return;
      }

      // Se concedida, obtém localização atual
      Geolocation.getCurrentPosition(
        (position) => {
          console.info('Localização atual obtida com sucesso.');
          console.log('Latitude: ', position.coords.latitude);
          console.log('Longitude: ', position.coords.longitude);
          setCurrentLatitude(position.coords.latitude.toString());
          setCurrentLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.warn('Erro ao obter localização:', error);
          Alert.alert('Erro', 'Não foi possível obter sua localização');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (err) {
      console.warn('Erro ao requisitar/obter localização:', err);
    }
  };

  /**
   * Solicita permissão de localização no Android. No iOS, o Geolocation getCurrentPosition
   * já solicita automaticamente. Para um controle mais granular no iOS, considere usar
   * react-native-permissions.
   */
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'Precisamos de acesso à sua localização para gerar o mapa astral.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('requestLocationPermission error:', err);
        return false;
      }
    }
    return true; // iOS ou outras plataformas
  };

  const checkUserLogin = async () => {
    try {
      const accessToken = await StorageService.getAccessToken();
      const userData = await StorageService.getUserData();

      if (accessToken && userData) {
        setIsLoading(true);
        setLoadingMessage('Usuário já logado. Redirecionando ...');
        const timer = setTimeout(() => {
          navigation.navigate('HomeScreen');
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Erro ao verificar login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções simplificadas para data e hora
  const handleConfirmDate = (selectedDate) => {
    setBirthDate(selectedDate);
  };

  const handleConfirmTime = (selectedTime) => {
    setBirthTime(selectedTime);
  };

  // Formatação
  const formatSelectedDate = (date) => {
    if (!date) return '';
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return  `${day}/${month}/${year} `;
  };

  const formatSelectedTime = (date) => {
    if (!date) return '';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return  `${hours}:${minutes < 10 ? '0' + minutes : minutes} `
  };

  // ----------------------------------------------------------------------
  // Validação
  // ----------------------------------------------------------------------
  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    if (!nome || nome.trim().length < 3) {
      tempErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
      isValid = false;
    }

    if (!birthCity || birthCity.trim().length < 2) {
      tempErrors.city = 'Cidade de nascimento é obrigatória';
      isValid = false;
    }

    if (!birthDate) {
      tempErrors.birthDate = 'Data de nascimento é obrigatória';
      isValid = false;
    }

    if (!birthTime) {
      tempErrors.birthTime = 'Hora de nascimento é obrigatória';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      tempErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!password || password.length < 6) {
      tempErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (password !== password_confirmation) {
      tempErrors.password_confirmation = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // ----------------------------------------------------------------------
  // Envio do formulário
  // ----------------------------------------------------------------------
  const handleSubmit = async () => {
    if (validateFields()) {
      try {
        setIsLoading(true);

        const encryptedPassword = CryptoService.encrypt(password);

        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthTime.getHours();
        const minute = birthTime.getMinutes();

        setLoadingMessage('Iniciando sua jornada astral ...');

        // Ajuste os nomes de campos conforme sua API espera
        const response = await api.post(
          'auth/register',
          {
            name: nome.trim(),
            email: email.trim(),
            password: password.trim(),
            password_confirmation: password_confirmation.trim(),

            // Dados de nascimento
            birth_city: birthCity.trim(),
            birth_year: parseInt(year, 10),
            birth_month: parseInt(month, 10),
            birth_day: parseInt(day, 10),
            birth_hour: parseInt(hour, 10),
            birth_minute: parseInt(minute, 10),

            // Coordenadas de nascimento (via autocomplete)
            birth_latitude: birthLatitude ? parseFloat(birthLatitude) : null,
            birth_longitude: birthLongitude ? parseFloat(birthLongitude) : null,

            // Coordenadas de localização atual (obtidas via react-native-geolocation-service)
            current_latitude: currentLatitude ? parseFloat(currentLatitude) : null,
            current_longitude: currentLongitude ? parseFloat(currentLongitude) : null,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        const { status, data } = response.data;

        if (status === 'success') {
          // Preparando dados do usuário para salvar localmente
          const userData = {
            name: data.name,
            email: data.email,
            email_verified_at: data.email_verified_at,
            uuid: data.uuid,
            encryptedPassword: encryptedPassword,
            extra_maps_max_number: data.extra_maps_max_number,
            birthData: {
              city: data.birth_city,
              year: data.birth_year,
              month: data.birth_month,
              day: data.birth_day,
              hour: data.birth_hour,
              minute: data.birth_minute,
              latitude: data.birth_latitude,
              longitude: data.birth_longitude,
            },

            // Localização atual do usuário
            currentLocation: {
              latitude: currentLatitude,
              longitude: currentLongitude,
            },
          };

          setLoadingMessage('Gerando seu mapa astral ...');

          await StorageService.saveUserData(userData);
          await StorageService.saveAccessToken(data.access_token);
          await StorageService.saveAstralMaps(data.astral_maps);

          navigation.navigate('HomeScreen');
        }

      } catch (error) {
        // Verificar se é um erro de resposta da API (422 - Unprocessable Entity)
        if (error.response && error.response.status === 422) {
          // Obter as mensagens de erro da resposta
          const errorData = error.response.data;
          console.log('Erro de validação:', errorData);
          
          // Se houver mensagens de erro específicas, exibi-las
          if (errorData.errors) {
            // Atualizar o estado de erros com as mensagens do servidor
            const serverErrors = {};
            
            // Mapear os erros do servidor para o formato do estado de erros
            Object.keys(errorData.errors).forEach(field => {
              // Converter os nomes dos campos da API para os nomes dos campos do formulário
              console.log('Campo:', field);
              console.log('Erro:', errorData.errors[field][0]);
              
              // Usar a primeira mensagem de erro para cada campo
              serverErrors[field] = errorData.errors[field][0];
            });
            
            setErrors(prev => ({...prev, ...serverErrors}));
            
            // Se houver uma mensagem geral, exibi-la na notificação
            if (errorData.message) {
              setErrorNotification({
                visible: true,
                message: errorData.message
              });
            }
          } else if (errorData.message) {
            // Se houver apenas uma mensagem geral
            setErrorNotification({
              visible: true,
              message: errorData.message
            });
          } else {
            // Fallback para mensagem genérica
            setErrorNotification({
              visible: true,
              message: 'Não foi possível completar o registro. Verifique os dados informados.'
            });
          }
        } else {
          // Para outros tipos de erro
          setErrorNotification({
            visible: true,
            message: 'Não foi possível completar o registro. Tente novamente mais tarde.'
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <View style={styles.container}>
      {memoStars}
      
      {/* Notificação de erro */}
      <ErrorNotification 
        visible={errorNotification.visible}
        message={errorNotification.message}
        onDismiss={() => setErrorNotification({ visible: false, message: '' })}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Precisamos de alguns dados para criar seu mapa astral!
            </Text>

            <View style={styles.form}>
              {/* Nome */}
              <View>
                <CustomInput
                  icon="person"
                  placeholder="Nome completo"
                  value={nome}
                  onChangeText={(text) => {
                    setNome(text);
                    setErrors((prev) => ({ ...prev, nome: '' }));
                  }}
                  error={errors.nome}
                  autoCapitalize="words"
                />
              </View>

              {/* Cidade de nascimento e coordenadas de nascimento via CityAutoComplete */}
              <View>
                <View style={styles.inputContainer}>
                  <Icon name="location-city" size={20} color="#7A708E" />
                  <CityAutoComplete
                    placeholderTextColor="#7A708E"
                    onCitySelected={(cityObj) => {
                      setBirthCity(cityObj.city);
                      setBirthLatitude(cityObj.latitude);
                      setBirthLongitude(cityObj.longitude);
                      setErrors((prev) => ({ ...prev, city: '' }));
                    }}
                    style={styles.input}
                  />
                </View>
                <ErrorMessage error={errors.city} />
              </View>

              {/* Data de nascimento */}
              <View>
                <CustomDateTimePicker
                  icon="calendar-today"
                  placeholder="Data de nascimento"
                  value={birthDate}
                  onChange={handleConfirmDate}
                  mode="date"
                  error={errors.birthDate}
                  format={formatSelectedDate}
                />
              </View>

              {/* Hora de nascimento */}
              <View>
                <CustomDateTimePicker
                  icon="access-time"
                  placeholder="Horário de nascimento"
                  value={birthTime}
                  onChange={handleConfirmTime}
                  mode="time"
                  error={errors.birthTime}
                  format={formatSelectedTime}
                />
              </View>

              {/* Email */}
              <View>
                <CustomInput
                  icon="email"
                  placeholder="E-mail"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  keyboardType="email-address"
                  error={errors.email}
                />
              </View>

              {/* Senha */}
              <View>
                <CustomInput
                  icon="lock"
                  placeholder="Senha"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  secureTextEntry
                  error={errors.password}
                />
              </View>

              {/* Confirmar senha */}
              <View>
                <CustomInput
                  icon="lock-outline"
                  placeholder="Confirmar senha"
                  value={password_confirmation}
                  onChangeText={(text) => {
                    setPasswordConfirmation(text);
                    setErrors((prev) => ({
                      ...prev,
                      password_confirmation: '',
                    }));
                  }}
                  secureTextEntry
                  error={errors.password_confirmation}
                />
              </View>

              <CustomButton
                title="Gerar meu Mapa Astral!"
                onPress={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  Já tem uma conta?{' '}
                  <Text style={styles.linkTextHighlight}>Faça login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#E0E0E0',
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    marginBottom: 30,
  },
  form: {
    gap: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 0,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  dateText: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  placeholder: {
    color: '#7A708E',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  linkButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
  },
  linkText: {
    color: '#7A708E',
    fontSize: 14,
  },
  linkTextHighlight: {
    color: '#6D44FF',
    fontWeight: 'bold',
  },
  eyeIcon: {
    padding: 10,
  },
});


