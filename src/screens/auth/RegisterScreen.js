// src/screens/auth/register/RegisterScreen.js

import React, { useState, useMemo, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location'; // <--- BIBLIOTECA EXPO-LOCATION

import api from '../../../services/api';
import StorageService from '../../../store/store';
import CryptoService from '../../../services/crypto';
import AnimatedStars from '../../../Components/animation/AnimatedStars';
import LoadingOverlay from '../../../Components/LoadingOverlay';

// Importamos nossos novos componentes
import RegisterHeader from '../../../Components/register/RegisterHeader';
import RegisterForm from '../../../Components/register/RegisterForm';

export default function RegisterScreen({ navigation }) {
  // Inputs de texto
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // Cidade de nascimento
  const [birthCity, setBirthCity] = useState('');
  const [birthLatitude, setBirthLatitude] = useState('');
  const [birthLongitude, setBirthLongitude] = useState('');

  // Localização atual do usuário
  const [currentLatitude, setCurrentLatitude] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('');

  // Data/Hora de nascimento
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());

  // Estados de UI
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

  // --------------------------------------------------------------------------------
  // Lógica de localização
  // --------------------------------------------------------------------------------
  const requestLocationAsync = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível obter sua localização!');
        return;
      }
      const currentPosition = await Location.getCurrentPositionAsync({});
      setCurrentLatitude(currentPosition.coords.latitude.toString());
      setCurrentLongitude(currentPosition.coords.longitude.toString());
    } catch (err) {
      console.warn('Erro ao requisitar/obter localização:', err);
    }
  };

  // Verificação de login
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

  // --------------------------------------------------------------------------------
  // DatePicker e TimePicker
  // --------------------------------------------------------------------------------
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleConfirmDate = (selectedDate) => {
    setBirthDate(selectedDate);
    hideDatePicker();
    setErrors((prev) => ({ ...prev, birthDate: '' }));
  };

  const handleConfirmTime = (selectedTime) => {
    setBirthTime(selectedTime);
    hideTimePicker();
    setErrors((prev) => ({ ...prev, birthTime: '' }));
  };

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

  // --------------------------------------------------------------------------------
  // Validação
  // --------------------------------------------------------------------------------
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

    if (password !== passwordConfirmation) {
      tempErrors.password_confirmation = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // --------------------------------------------------------------------------------
  // Submissão do formulário
  // --------------------------------------------------------------------------------
  const handleSubmit = async () => {
    if (validateFields()) {
      try {
        setIsLoading(true);
        setLoadingMessage('Iniciando sua jornada astral ...');

        const encryptedPassword = CryptoService.encrypt(password);

        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthTime.getHours();
        const minute = birthTime.getMinutes();

        // Chamada à API
        const response = await api.post(
          'auth/register',
          {
            name: nome.trim(),
            email: email.trim(),
            password: password.trim(),
            password_confirmation: passwordConfirmation.trim(),

            // Dados de nascimento
            birth_city: birthCity.trim(),
            birth_year: parseInt(year, 10),
            birth_month: parseInt(month, 10),
            birth_day: parseInt(day, 10),
            birth_hour: parseInt(hour, 10),
            birth_minute: parseInt(minute, 10),

            // Coordenadas de nascimento
            birth_latitude: birthLatitude ? parseFloat(birthLatitude) : null,
            birth_longitude: birthLongitude ? parseFloat(birthLongitude) : null,

            // Localização atual
            current_latitude: currentLatitude ? parseFloat(currentLatitude) : null,
            current_longitude: currentLongitude ? parseFloat(currentLongitude) : null,
          },
          {
            headers: { 'Content-Type': 'application/json' },
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

            // Dados de nascimento
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
            // Localização atual
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
        console.error('Erro:', error);
        Alert.alert('Erro', 'Não foi possível completar o registro');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Navegar para login
  const handleNavigateToLogin = () => {
    navigation.navigate('LoginScreen');
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
          bounces
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Componente de Cabeçalho */}
            <RegisterHeader />

            {/* Componente de Formulário */}
            <RegisterForm
              nome={nome}
              setNome={(text) => {
                setNome(text);
                setErrors((prev) => ({ ...prev, nome: '' }));
              }}
              email={email}
              setEmail={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              password={password}
              setPassword={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              passwordConfirmation={passwordConfirmation}
              setPasswordConfirmation={(text) => {
                setPasswordConfirmation(text);
                setErrors((prev) => ({
                  ...prev,
                  password_confirmation: '',
                }));
              }}
              birthCity={birthCity}
              setBirthCity={(city) => {
                setBirthCity(city);
                setErrors((prev) => ({ ...prev, city: '' }));
              }}
              setBirthLatitude={setBirthLatitude}
              setBirthLongitude={setBirthLongitude}
              birthDate={birthDate}
              birthTime={birthTime}
              showDatePicker={showDatePicker}
              showTimePicker={showTimePicker}
              formatSelectedDate={formatSelectedDate}
              formatSelectedTime={formatSelectedTime}
              errors={errors}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onNavigateToLogin={handleNavigateToLogin}
            />
            
            {/* DatePickers e TimePickers */}
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

// Estilos específicos da tela
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
});
