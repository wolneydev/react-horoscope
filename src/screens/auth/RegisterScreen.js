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
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthLatitude, setBirthLatitude] = useState('');
  const [birthLongitude, setBirthLongitude] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());
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
  const [errorNotification, setErrorNotification] = useState({
    visible: false,
    message: ''
  });

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

  const handleConfirmDate = (selectedDate) => setBirthDate(selectedDate);
  const handleConfirmTime = (selectedTime) => setBirthTime(selectedTime);

  const formatSelectedDate = (date) =>
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} `;

  const formatSelectedTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} `;
  };

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

  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      setIsLoading(true);
      setLoadingMessage('Iniciando sua jornada astral ...');

      const encryptedPassword = CryptoService.encrypt(password);
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      const hour = birthTime.getHours();
      const minute = birthTime.getMinutes();

      const response = await api.post(
        'auth/register',
        {
          name: nome.trim(),
          email: email.trim(),
          password: password.trim(),
          password_confirmation: password_confirmation.trim(),
          birth_city: birthCity.trim(),
          birth_year: year,
          birth_month: month,
          birth_day: day,
          birth_hour: hour,
          birth_minute: minute,
          birth_latitude: birthLatitude ? parseFloat(birthLatitude) : null,
          birth_longitude: birthLongitude ? parseFloat(birthLongitude) : null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const { status, data } = response.data;

      if (status === 'success') {
        const userData = {
          name: data.name,
          email: data.email,
          email_verified_at: data.email_verified_at,
          uuid: data.uuid,
          encryptedPassword,
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
        };

        setLoadingMessage('Gerando seu mapa astral ...');
        await StorageService.saveUserData(userData);
        await StorageService.saveAccessToken(data.access_token);
        await StorageService.saveAstralMaps(data.astral_maps);
        navigation.navigate('HomeScreen');
      }

    } catch (error) {
      const errorData = error?.response?.data;
      if (error?.response?.status === 422 && errorData?.errors) {
        const serverErrors = {};
        Object.keys(errorData.errors).forEach(field => {
          serverErrors[field] = errorData.errors[field][0];
        });
        setErrors(prev => ({ ...prev, ...serverErrors }));
        setErrorNotification({
          visible: true,
          message: errorData.message || 'Erro ao registrar usuário.',
        });
      } else {
        setErrorNotification({
          visible: true,
          message: 'Não foi possível completar o registro. Tente novamente mais tarde.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorMessage = ({ error }) =>
    error ? <Text style={styles.errorText}>{error}</Text> : null;

  return (
    <View style={styles.container}>
      {memoStars}
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
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Precisamos de alguns dados para criar seu mapa astral!
            </Text>

            <View style={styles.form}>
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

              <CustomDateTimePicker
                icon="calendar-today"
                placeholder="Data de nascimento"
                value={birthDate}
                onChange={handleConfirmDate}
                mode="date"
                error={errors.birthDate}
                format={formatSelectedDate}
              />

              <CustomDateTimePicker
                icon="access-time"
                placeholder="Horário de nascimento"
                value={birthTime}
                onChange={handleConfirmTime}
                mode="time"
                error={errors.birthTime}
                format={formatSelectedTime}
              />

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

              <CustomInput
                icon="lock-outline"
                placeholder="Confirmar senha"
                value={password_confirmation}
                onChangeText={(text) => {
                  setPasswordConfirmation(text);
                  setErrors((prev) => ({ ...prev, password_confirmation: '' }));
                }}
                secureTextEntry
                error={errors.password_confirmation}
              />

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
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
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
});
