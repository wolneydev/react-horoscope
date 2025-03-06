// src/screens/auth/register/CreateExtraChartScreen.js

import React, { useState, useMemo } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
  FlatList,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '../services/api';
import StorageService from '../store/store';
import AnimatedStars from '../Components/animation/AnimatedStars';
import LoadingOverlay from '../Components/LoadingOverlay';
import { useNavigation } from '@react-navigation/native';

// Exemplo de import do seu JSON de cidades
// Ajuste o path conforme seu projeto, caso tenha:
import citiesBr from '../data/geo/citiesBr';

const CreateExtraChartScreen = () => {
  const navigation = useNavigation();

  // Campos existentes
  const [nome, setNome] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());

  // Estados para o picker
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  // Estado da cidade (o que o usuário digita)
  const [city, setCity] = useState('');

  // Lista filtrada para o dropdown de sugestões
  const [filteredCities, setFilteredCities] = useState([]);

  // Estado para armazenar objeto selecionado da lista (opcional se quiser usar)
  const [citySelected, setCitySelected] = useState(null);

  // Estados adicionais para latitude, longitude e timezone
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezone, setTimezone] = useState('');

  // Estados de erro e loading
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

  // Animação de fundo (memoizada)
  const memoStars = useMemo(() => <AnimatedStars />, []);

  // Componente de mensagem de erro
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  // --- Picker de Data e Hora ---
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleConfirmDate = (date) => {
    setBirthDate(date);
    hideDatePicker();
  };

  const handleConfirmTime = (time) => {
    setBirthTime(time);
    hideTimePicker();
  };

  // Formatação de data/hora
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

  // --- Funções de Busca e Seleção da Cidade ---
  const handleSearchCity = (text) => {
    setCity(text);

    // Se o campo estiver vazio, limpa o dropdown
    if (!text) {
      setFilteredCities([]);
      return;
    }

    // Filtra as cidades do JSON
    const query = text.toLowerCase();
    const results = citiesBr.cities
      .filter((item) => item.city.toLowerCase().includes(query))
      .slice(0, 10);

    setFilteredCities(results);
  };

  const handleSelectCity = (item) => {
    // Quando o usuário clica na sugestão
    setCity(item.city); // apenas o nome da cidade no campo
    setCitySelected(item);

    // Se seu JSON tiver latitude/longitude/timezone:
    setLatitude(String(item.latitude) || '');
    setLongitude(String(item.longitude) || '');
    setTimezone(item.timezone || '');

    // Limpa a lista de sugestões
    setFilteredCities([]);
  };

  // --- Validação ---
  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    if (!nome || nome.trim().length < 3) {
      tempErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
      isValid = false;
    }

    if (!city || city.trim().length < 2) {
      tempErrors.city = 'Cidade é obrigatória';
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

    setErrors(tempErrors);
    return isValid;
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (validateFields()) {
      try {
        setIsLoading(true);

        const accessToken = await StorageService.getAccessToken();

        console.log('Token:', accessToken);
        

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

            // Novos campos
            birth_latitude: latitude ? parseFloat(latitude) : null,
            birth_longitude: longitude ? parseFloat(longitude) : null,
            birth_timezone: timezone || '',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const { status, data } = response.data;

        if (status === 'success') {
          // Terceiro passo
          setLoadingMessage('Gerando o mapa astral ...');

          if (data.astral_map) {
            navigation.navigate('HomeScreen', {
              screen: 'Mapa Astral',
              params: { astralMap: data.astral_map },
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


  return (
    <View style={styles.container}>
      {memoStars}

      <View style={styles.content}>
        <Text style={styles.title}>Novo Mapa Astral</Text>
        <Text style={styles.subtitle}>
          Preencha os dados para gerar um novo mapa astral
        </Text>

        <View style={styles.form}>
          {/* Campo Nome */}
          <View>
            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#7A708E" />
              <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#7A708E"
                value={nome}
                onChangeText={setNome}
              />
            </View>
            <ErrorMessage error={errors.nome} />
          </View>

          {/* Campo Cidade + Dropdown de sugestões */}
          <View>
            <View style={styles.inputContainer}>
              <Icon name="location-city" size={20} color="#7A708E" />
              <TextInput
                style={[styles.input, { marginLeft: 10 }]}
                placeholder="Cidade de nascimento"
                placeholderTextColor="#7A708E"
                value={city}
                onChangeText={handleSearchCity}
              />
            </View>

            {filteredCities.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={filteredCities}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSelectCity(item)}
                    >
                      <Text style={styles.suggestionText}>
                        {item.city}, {item.state}, {item.country}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            <ErrorMessage error={errors.city} />
          </View>
          <View>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={showDatePicker}
            >
              <Icon name="calendar-today" size={20} color="#7A708E" />
              <Text style={[styles.dateText, !birthDate && styles.placeholder]}>
                {birthDate ? formatDate(birthDate) : 'Data de nascimento'}
              </Text>
            </TouchableOpacity>
            <ErrorMessage error={errors.birthDate} />
          </View>

          {/* Hora de nascimento */}
          <View>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={showTimePicker}
            >
              <Icon name="access-time" size={20} color="#7A708E" />
              <Text style={[styles.dateText, !birthTime && styles.placeholder]}>
                {birthTime ? formatTime(birthTime) : 'Horário de nascimento'}
              </Text>
            </TouchableOpacity>
            <ErrorMessage error={errors.birthTime} />
          </View>

          {/* Botão de Envio */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Gerar Mapa Astral</Text>
          </TouchableOpacity>
        </View>

        {/* DateTimePickers */}
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

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </View>
  );
};

export default CreateExtraChartScreen;

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
    marginBottom: 20,
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
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 5,
    height: 55,
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
  /** Estilos do dropdown de cidades */
  suggestionsContainer: {
    position: 'absolute',
    top: 60, // Ajuste conforme sua UI
    left: 45,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 999,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    color: '#000',
  },
});
