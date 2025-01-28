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

export default function RegisterScreen({ navigation }) {
  
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';

  const [nome, setNome] = useState('Itu Assis');
  const [city, setCity] = useState('Itu');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());
  const [email, setEmail] = useState('12311212@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [password_confirmation, setPasswordConfirmation] = useState('12345678');
  const [isEmailRegistrationVisible, setEmailRegistrationVisibility] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const animation = useRef(new Animated.Value(0)).current; // Initialize animated value
  
  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

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

  // Função que chama a API
  const handleSubmit = async () => {

    // Criptografa a senha antes de salvar o estado
    const encryptedPassword = CryptoService.encrypt(password);
    console.log('encryptedPassword', encryptedPassword);

    try {
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
      console.log(response.data);

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

        // Salvando dados usando o serviço
        await StorageService.saveUserData(userData);
        await StorageService.saveAccessToken(data.access_token);
        await StorageService.saveAstralMap(data.astral_map);

        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Não foi possível completar o registro');
    }
  };

  const toggleEmailRegistration = () => {
      // Show the view
      setEmailRegistrationVisibility(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], // Adjust the height as needed
  });

  const animatedOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const handleGerarMapaAstral = async () => {
    try {
      toggleEmailRegistration();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro na requisição', 'Verifique o console para mais detalhes.');
    }
  };

  return (
    <View style={styles.container}>
      {memoStars}
      <View style={styles.section}>
        
        <Text style={styles.sectionDescription}>
          Vamos procurar seu par ideal com base no seu mapa astral!
        </Text>

        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#7A708E" />
          <TextInput
            style={styles.input}
            placeholder="Informe o seu Nome"
            placeholderTextColor="#7A708E"
            onChangeText={setNome}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="location-city" size={20} color="#7A708E" />
          <TextInput
            style={styles.input}
            placeholder="Informe a cidade de nascimento"
            placeholderTextColor="#7A708E"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={showDatePicker} activeOpacity={0.7}>
          <View style={styles.dateButtonContent}>
            <Icon name="calendar-today" size={20} color="#7A708E" />
            <Text style={styles.dateButtonText}>
              {birthDate ? formatSelectedDate(birthDate) : "Selecionar a data de nascimento"}
            </Text>
          </View>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={birthDate}
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          is24Hour={isAndroid}
        />

        
        <TouchableOpacity style={styles.dateButton} onPress={showTimePicker} activeOpacity={0.7}>
          <View style={styles.dateButtonContent}>
            <Icon name="access-time" size={20} color="#7A708E" />
            <Text style={styles.dateButtonText}>
              {birthTime ? formatSelectedTime(birthTime) : "Selecione o horário de nascimento"}
            </Text>
          </View>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          date={birthTime}
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
          is24Hour={isAndroid}
        />

        <TouchableOpacity style={styles.button} onPress={handleGerarMapaAstral} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Gerar Mapa Astral</Text>
        </TouchableOpacity>

        {isEmailRegistrationVisible && (
          <Animated.View style={[styles.emailRegistration, { height: animatedHeight, opacity: animatedOpacity }]}>
            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#7A708E" />
              <TextInput
                style={styles.input}
                placeholder="Informe E-mail"
                placeholderTextColor="#7A708E"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#7A708E" />
              <TextInput
                style={styles.input}
                placeholder="Informe a senha"
                placeholderTextColor="#7A708E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#7A708E" />
              <TextInput
                style={styles.input}
                placeholder="Confirme a senha"
                placeholderTextColor="#7A708E"
                value={password_confirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.7}>
              <Text style={styles.buttonText}>Gerar Mapa Astral</Text>
            </TouchableOpacity>
          </Animated.View>
          
        )}

      </View>
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
    flex: 1,
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
    backgroundColor: 'rgba(109, 68, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#F9F8F8',
    marginLeft: 10, // Espaço entre o ícone e o texto
  },
  dateButton: {
    backgroundColor: '#2C2840',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#C9BBCF',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#FFD700', // Dourado para contrastar com o fundo
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: '#1E1B29', // Texto escuro para contraste com o dourado
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleButtonText: {
    color: '#fff',
  },
});
