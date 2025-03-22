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
import CustomButton from '../Components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import InfoCard from '../Components/InfoCard';
import { COLORS, SPACING, FONTS } from '../styles/theme';
import CityAutoComplete from '../Components/CityAutoComplete';

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
  const [birthCity, setBirthCity] = useState('');
  const [birthLatitude, setBirthLatitude] = useState('');
  const [birthLongitude, setBirthLongitude] = useState('');

  // Estados adicionais para latitude, longitude e timezone
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
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

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
  
  // --- Validação ---
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
            birth_city: birthCity.trim(),
            birth_year: parseInt(year, 10),
            birth_month: parseInt(month, 10),
            birth_day: parseInt(day, 10),
            birth_hour: parseInt(hour, 10),
            birth_minute: parseInt(minute, 10),

            // Novos campos
            birth_latitude: birthLatitude ? parseFloat(birthLatitude) : null,
            birth_longitude: birthLongitude ? parseFloat(birthLongitude) : null,
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

          // Limpa os campos
          setNome('');

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
        <View style={styles.header}>
          <InfoCard
            title="Novo Mapa Astral"
            description="Preencha os dados abaixo para gerar um novo mapa astral. Você poderá visualizar as posições dos planetas, casas astrológicas e aspectos, além de poder comparar este mapa com o seu através da sinastria."
            icon="auto-awesome"
            isInfoExpanded={isInfoExpanded}
            setIsInfoExpanded={setIsInfoExpanded}
            expandable={true}
          />
        </View>

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
          <CustomButton
            title="Gerar Mapa Astral"
            onPress={handleSubmit}
            icon="auto-awesome"
            style={styles.customButton}
          />
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
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    padding: SPACING.LARGE,    
  },
  header: {
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontSize: FONTS.SIZES.TITLE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.SIZES.MEDIUM,
    color: COLORS.TEXT_TERTIARY,
    marginBottom: SPACING.LARGE,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.MEDIUM,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    marginBottom: 5,
    height: 55,
  },
  input: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.MEDIUM,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  dateText: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.MEDIUM,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  placeholder: {
    color: COLORS.TEXT_TERTIARY,
  },
  customButton: {
    marginTop: SPACING.LARGE,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.TINY,
    marginTop: 4,
    marginLeft: SPACING.MEDIUM,
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
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    color: '#000',
  },
});
