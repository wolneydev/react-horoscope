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
import api from '../services/api';
import StorageService from '../store/store';
import CryptoService from '../services/crypto';
import AnimatedStars from '../Components/animation/AnimatedStars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingOverlay from '../Components/LoadingOverlay';
import { useNavigation } from '@react-navigation/native';

const CreateExtraChartScreen = () => {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const handleConfirmDate = (date) => {
    setBirthDate(date);
    hideDatePicker();
  };

  const handleConfirmTime = (time) => {
    setBirthTime(time);
    hideTimePicker();
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      try {
        setIsLoading(true);

        const accessToken = await StorageService.getAccessToken();

        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthTime.getHours();
        const minute = birthTime.getMinutes();

        // Primeiro passo
        setLoadingMessage('Estabelecendo comunicação astral ...');
        
        const response = await api.post(
          'astralmap/create',
          {
            name: nome.trim(),
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
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        const { status, data } = response.data;

        if (status === 'success') {
          
          // Terceiro passo
          setLoadingMessage('Gerando o mapa astral ...');
          
          // Salvando dados usando o serviço
          await StorageService.saveAstralMap(data.astral_map);

          if (data.astral_map) {
            navigation.navigate('HomeScreen', { 
              screen: 'Mapa Astral', 
              params: { astralMap: data.astral_map } 
            });
          }
        }
      } catch (error) {
        console.error('Erro:', error);
        Alert.alert('Erro', 'Não foi possível completar o registro');
      } finally {
        setIsLoading(false);
      }
    }
  };

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

  // Componente para mostrar mensagem de erro
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <View style={styles.container}>
      {memoStars}
      <View style={styles.content}>
        <Text style={styles.title}>Novo Mapa Astral</Text>
        <Text style={styles.subtitle}>
          Preencha os dados para gerar um novo mapa astral
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
                onChangeText={setNome}
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
                onChangeText={setCity}
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
                {birthDate ? formatDate(birthDate) : "Data de nascimento"}
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
                {birthTime ? formatTime(birthTime) : "Horário de nascimento"}
              </Text>
            </TouchableOpacity>
            <ErrorMessage error={errors.birthTime} />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Gerar Mapa Astral</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          date={birthDate}
        />

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
          date={birthTime}
        />
      </View>
      
      {/* Loading Overlay com mensagem */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}
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
    fontSize: 16,
    color: '#7A708E',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 15,
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
    backgroundColor: '#6D44FF',
    borderRadius: 12,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
});

export default CreateExtraChartScreen;
