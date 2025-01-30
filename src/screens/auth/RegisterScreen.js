// src/screens/auth/register/RegisterScreen.js
import React, { useState, useRef, useMemo } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import api from '../../services/api';
import StorageService from '../../store/store';
import CryptoService from '../../services/crypto';
import AnimatedStars from '../../Components/animation/AnimatedStars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingOverlay from '../../Components/LoadingOverlay';

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
  const [isEmailRegistrationVisible, setEmailRegistrationVisibility] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [showAdvanceButton, setShowAdvanceButton] = useState(true);
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

  const animation = useRef(new Animated.Value(0)).current; // Initialize animated value
  
  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

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

    // Validações dos campos de email e senha quando visíveis
    if (isEmailRegistrationVisible) {
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
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleAdvance = () => {
    if (validateFields()) {
      toggleEmailRegistration();
    }
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
          await StorageService.saveAstralMap(data.astral_map);

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

  const toggleEmailRegistration = () => {
    setEmailRegistrationVisibility(true);
    setShowAdvanceButton(false);
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Ajuste este valor conforme necessário
  });

  const animatedOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  // Componente para mostrar mensagem de erro
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <View style={styles.container}>
      {memoStars}
      <View style={styles.section}>
        
        <Text style={styles.sectionDescription}>
          Vamos precisar de alguns dados para criar seu mapa astral!
        </Text>

        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#7A708E" />
          <TextInput
            style={[styles.input, errors.nome && styles.inputError]}
            placeholder="Informe o seu Nome"
            placeholderTextColor="#7A708E"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              setErrors(prev => ({ ...prev, nome: '' }));
            }}
          />
        </View>
        <ErrorMessage error={errors.nome} />

        <View style={styles.inputContainer}>
          <Icon name="location-city" size={20} color="#7A708E" />
          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            placeholder="Informe a cidade de nascimento"
            placeholderTextColor="#7A708E"
            value={city}
            onChangeText={(text) => {
              setCity(text);
              setErrors(prev => ({ ...prev, city: '' }));
            }}
          />
        </View>
        <ErrorMessage error={errors.city} />

        <TouchableOpacity 
          style={[styles.inputContainer, errors.birthDate && styles.inputError]} 
          onPress={showDatePicker}
        >
          <Icon name="calendar-today" size={20} color="#7A708E" />
          <Text style={[
            styles.dateButtonText,
            !birthDate && styles.placeholderText
          ]}>
            {birthDate ? formatSelectedDate(birthDate) : "Selecionar a data de nascimento"}
          </Text>
        </TouchableOpacity>
        <ErrorMessage error={errors.birthDate} />

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={birthDate}
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          is24Hour={isAndroid}
          buttonTextColorIOS="#6D44FF"
          themeVariant="dark"
          accentColor="#6D44FF"
          textColor="#FFFFFF"
        />

        <TouchableOpacity 
          style={[styles.inputContainer, errors.birthTime && styles.inputError]}
          onPress={showTimePicker}
        >
          <Icon name="access-time" size={20} color="#7A708E" />
          <Text style={[
            styles.dateButtonText,
            !birthTime && styles.placeholderText
          ]}>
            {birthTime ? formatSelectedTime(birthTime) : "Selecione o horário de nascimento"}
          </Text>
        </TouchableOpacity>
        <ErrorMessage error={errors.birthTime} />

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          date={birthTime}
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
          is24Hour={isAndroid}
          buttonTextColorIOS="#6D44FF"
          themeVariant="dark"
          accentColor="#6D44FF"
          textColor="#FFFFFF"
        />

        <View style={styles.buttonContainer}>
          {showAdvanceButton ? (
            <CustomButton 
              title="Avançar" 
              onPress={handleAdvance}
            />
          ) : (
            <Text style={styles.sectionDescription}>
              Só mais uma etapa! Precisamos de seu e-mail para criar sua conta conosco!
            </Text>
          )}
        </View>

        {isEmailRegistrationVisible && (
          <Animated.View 
            style={[
              styles.emailRegistration, 
              { 
                height: animatedHeight,
                opacity: animatedOpacity 
              }
            ]}
          >
            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#7A708E" />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Informe E-mail"
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

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#7A708E" />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Informe a senha"
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

            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#7A708E" />
              <TextInput
                style={[styles.input, errors.password_confirmation && styles.inputError]}
                placeholder="Confirme a senha"
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

            <View style={styles.buttonContainer}>
              <CustomButton 
                title="Gerar meu Mapa Astral!" 
                onPress={handleSubmit}
              />
            </View>
          </Animated.View>
        )}
      </View>
      
      {/* Loading Overlay com mensagem */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </View>
  );
}

// Estilos de tema noturno/astral:
const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#1E1B29',
  },  
  section: {
    marginTop: 80,
    justifyContent: 'center',
    padding: 20,
  },
  sectionDescription: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#E0E0E0',
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    marginBottom: 20,
  },
  section30: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 20,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#F9F8F8', // Tom claro para contraste
  },
  label: {
    fontSize: 16,
    color: '#C9BBCF', // Tom suave para textos
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 178, 170, 0.15)', // Light Sea Green
    borderColor: '#20B2AA',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 10,
    height: 50, // Altura fixa para manter consistência
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#F9F8F8',
    marginLeft: 10, // Espaço entre o ícone e o texto
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 10,
    color: '#F9F8F8', // Cor quando tem valor selecionado
  },
  placeholderText: {
    color: '#7A708E', // Mesma cor do placeholderTextColor dos inputs
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
  toggleButtonText: {
    color: '#fff',
  },
  emailRegistration: {
    overflow: 'hidden',
  },
  advanceText: {
    color: '#FFD700', // Dourado para destaque
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '500',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 10,
  },
  inputError: {
    borderColor: '#ff4444',
  },
});
