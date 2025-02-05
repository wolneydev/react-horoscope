// src/screens/auth/register/RegisterScreen.js
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import api from '../../services/api';
import StorageService from '../../store/store';
import CryptoService from '../../services/crypto';
import AnimatedStars from '../../Components/animation/AnimatedStars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingOverlay from '../../Components/LoadingOverlay';
import CustomButton from '../../Components/CustomButton';

export default function RegisterScreen({ navigation }) {
  
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';

  const [nome, setNome] = useState('Itu Assis');
  const [city, setCity] = useState('Itu');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());
  const [email, setEmail] = useState('danielfreitas@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [password_confirmation, setPasswordConfirmation] = useState('12345678');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
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

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  useEffect(() => {
    checkUserLogin();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkUserLogin();
    }, [])
  );

  const checkUserLogin = async () => {
    try {
      const accessToken = await StorageService.getAccessToken();
      const userData = await StorageService.getUserData();
      console.log(accessToken, userData);
      
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

  // Mostrar/ocultar modal de Data
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Mostrar/ocultar modal de Hora
  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };
  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  // Callback ao confirmar a data
  const handleConfirmDate = (selectedDate) => {
    setBirthDate(selectedDate);
    hideDatePicker();
  };

  // Callback ao confirmar a hora
  const handleConfirmTime = (selectedTime) => {
    setBirthTime(selectedTime);
    hideTimePicker();
  };

  // Formatação simples
  const formatSelectedDate = (date) => {
    if (!date) return '';
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatSelectedTime = (date) => {
    if (!date) return '';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };

  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    // Validação do nome
    if (!nome || nome.trim().length < 3) {
      tempErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
      isValid = false;
    }

    // Validação da cidade
    if (!city || city.trim().length < 2) {
      tempErrors.city = 'Cidade é obrigatória';
      isValid = false;
    }

    // Validação da data de nascimento
    if (!birthDate) {
      tempErrors.birthDate = 'Data de nascimento é obrigatória';
      isValid = false;
    }

    // Validação da hora de nascimento
    if (!birthTime) {
      tempErrors.birthTime = 'Hora de nascimento é obrigatória';
      isValid = false;
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      tempErrors.email = 'Email inválido';
      isValid = false;
    }

    // Validação da senha
    if (!password || password.length < 6) {
      tempErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    // Validação da confirmação de senha
    if (password !== password_confirmation) {
      tempErrors.password_confirmation = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      try {
        setIsLoading(true);

        // Criptografa a senha antes de salvar o estado
        const encryptedPassword = CryptoService.encrypt(password);

        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthTime.getHours();
        const minute = birthTime.getMinutes();

        // Primeiro passo
        setLoadingMessage('Iniciando sua jornada astral ...');
        
        const response = await api.post(
          'auth/register',
          {
            name: nome.trim(),
            email: email.trim(),
            password: password.trim(),
            password_confirmation: password_confirmation.trim(),
            birth_city: city.trim(),
            birth_year: parseInt(year, 10),
            birth_month: parseInt(month, 10),
            birth_day: parseInt(day, 10),
            birth_hour: parseInt(hour, 10),
            birth_minute: parseInt(minute, 10),
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { status, data } = response.data;

        if (status === 'success') {
          
          // Preparando dados do usuário
          const userData = {
            name: data.name,
            email: data.email,
            email_verified_at: data.email_verified_at,
            uuid: data.uuid,
            encryptedPassword: encryptedPassword,
            birthData: {
              city: data.birth_city,
              year: data.birth_year,
              month: data.birth_month,
              day: data.birth_day,
              hour: data.birth_hour,
              minute: data.birth_minute
            }
          };

          // Terceiro passo
          setLoadingMessage('Gerando seu mapa astral ...');
          
          // Salvando dados usando o serviço
          await StorageService.saveUserData(userData);
          await StorageService.saveAccessToken(data.access_token);
          await StorageService.saveAstralMaps(data.astral_maps);

          navigation.navigate('HomeScreen');
        }
      } catch (error) {
        console.error('Erro:', error);
        Alert.alert('Erro', 'Não foi possível completar o registro');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Componente para mostrar mensagem de erro
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <View style={styles.container}>
      {memoStars}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Vamos precisar de alguns dados para criar seu mapa astral!
            </Text>

            <View style={styles.form}>
              <View>
                <View style={styles.inputContainer}>
                  <Icon name="person" size={20} color="#7A708E" />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#7A708E"
                    value={nome}
                    onChangeText={(text) => {
                      setNome(text);
                      setErrors(prev => ({ ...prev, nome: '' }));
                    }}
                  />
                </View>
                <ErrorMessage error={errors.nome} />
              </View>

              <View>
                <View style={styles.inputContainer}>
                  <Icon name="location-city" size={20} color="#7A708E" />
                  <TextInput
                    style={styles.input}
                    placeholder="Cidade de nascimento"
                    placeholderTextColor="#7A708E"
                    value={city}
                    onChangeText={(text) => {
                      setCity(text);
                      setErrors(prev => ({ ...prev, city: '' }));
                    }}
                  />
                </View>
                <ErrorMessage error={errors.city} />
              </View>

              <View>
                <TouchableOpacity 
                  style={styles.inputContainer} 
                  onPress={showDatePicker}
                >
                  <Icon name="calendar-today" size={20} color="#7A708E" />
                  <Text style={[styles.dateText, !birthDate && styles.placeholder]}>
                    {birthDate ? formatSelectedDate(birthDate) : "Data de nascimento"}
                  </Text>
                </TouchableOpacity>
                <ErrorMessage error={errors.birthDate} />
              </View>

              <View>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={showTimePicker}
                >
                  <Icon name="access-time" size={20} color="#7A708E" />
                  <Text style={[styles.dateText, !birthTime && styles.placeholder]}>
                    {birthTime ? formatSelectedTime(birthTime) : "Horário de nascimento"}
                  </Text>
                </TouchableOpacity>
                <ErrorMessage error={errors.birthTime} />
              </View>

              <View>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color="#7A708E" />
                  <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    placeholderTextColor="#7A708E"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <ErrorMessage error={errors.email} />
              </View>

              <View>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color="#7A708E" />
                  <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#7A708E"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    secureTextEntry
                  />
                </View>
                <ErrorMessage error={errors.password} />
              </View>

              <View>
                <View style={styles.inputContainer}>
                  <Icon name="lock-outline" size={20} color="#7A708E" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar senha"
                    placeholderTextColor="#7A708E"
                    value={password_confirmation}
                    onChangeText={(text) => {
                      setPasswordConfirmation(text);
                      setErrors(prev => ({ ...prev, password_confirmation: '' }));
                    }}
                    secureTextEntry
                  />
                </View>
                <ErrorMessage error={errors.password_confirmation} />
              </View>

              <CustomButton
                title="Gerar meu Mapa Astral!"
                onPress={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
                style={styles.customButton}
              />

              <TouchableOpacity 
                onPress={() => navigation.navigate('LoginScreen')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  Já tem uma conta? <Text style={styles.linkTextHighlight}>Faça login</Text>
                </Text>
              </TouchableOpacity>

            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={hideDatePicker}
              date={birthDate}
              themeVariant="dark"
            />

            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={handleConfirmTime}
              onCancel={hideTimePicker}
              date={birthTime}
              themeVariant="dark"
            />
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
    textAlign: 'center',
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(109, 68, 255, 0.15)',
    padding: 15,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  emailRegistration: {
    gap: 10,
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
  customButton: {
    marginVertical: 5,
  },
});
