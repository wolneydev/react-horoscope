// src/screens/auth/register/AstralMapDataFormScreen.js
import React, { useState, useRef } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Alert,
  ImageBackground,
  Animated
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import api from '../../../services/api';
import StorageService from '../../../store/store';

export default function AstralMapDataFormScreen({ navigation }) {
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
    try {
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      const hour = birthTime.getHours();
      const minute = birthTime.getMinutes();

      const mail = email.trim();
      console.log(`Enviando email: ${mail}`);

      let platformMsg = isAndroid ? 'Enviando do Android...' : 'Enviando do iOS...';
      console.log(platformMsg);

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
          uuid: data.uuid,
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

        navigation.navigate('AstralMapScreen');
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
      <ImageBackground source={require('../../../assets/images/starry-night2.jpg')} style={styles.section}>
        <View style={styles.section}>
          
          <Text style={styles.sectionDescription}>
            Vamos procurar seu par ideal com base no seu mapa astral!
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Informe o seu Nome"
            placeholderTextColor="#7A708E"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Informe a cidade de nascimento:</Text>
          <TextInput
            style={styles.input}
            placeholder="Informe a cidade de nascimento"
            placeholderTextColor="#7A708E"
            value={city}
            onChangeText={setCity}
          />

          <Text style={styles.label}>Selecione a data de nascimento:</Text>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker} activeOpacity={0.7}>
            <Text style={styles.dateButtonText}>
              {formatSelectedDate(birthDate) || 'Escolher Data'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={birthDate}
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
            is24Hour={isAndroid}
          />

          <Text style={styles.label}>Selecione o horário de nascimento:</Text>
          <TouchableOpacity style={styles.dateButton} onPress={showTimePicker} activeOpacity={0.7}>
            <Text style={styles.dateButtonText}>
              {formatSelectedTime(birthTime) || 'Escolher Horário'}
            </Text>
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

          {/* Conditionally render the email registration view with animation */}
          {isEmailRegistrationVisible && (
            <Animated.View style={[styles.emailRegistration, { height: animatedHeight, opacity: animatedOpacity }]}>
              <Text style={styles.emailRegistrationText}>Email Registration Form</Text>
              <TextInput
                style={styles.input}
                placeholder="Informe E-mail"
                placeholderTextColor="#7A708E"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Informe a senha"
                placeholderTextColor="#7A708E"
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirme a senha"
                placeholderTextColor="#7A708E"
                value={password_confirmation}
                onChangeText={setPasswordConfirmation}
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.7}>
                <Text style={styles.buttonText}>Gerar Mapa Astral</Text>
              </TouchableOpacity>
            </Animated.View>
            
          )}

        </View>
        
      
      </ImageBackground>
    </View>
  );
}

// Estilos de tema noturno/astral:
const styles = StyleSheet.create({
  
  container: {
    flex: 1,
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
  input: {
    backgroundColor: '#2C2840',
    borderWidth: 1,
    borderColor: '#FFD700', // Mesmo tom dourado para dar destaque
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#F9F8F8',      // Texto claro para melhor leitura
  },
  dateButton: {
    backgroundColor: '#2C2840',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#C9BBCF',
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
