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
  Image,
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
import MessageModal from '../Components/MessageModal';
import { useUser } from '../contexts/UserContext';
import UserInfoHeader from '../Components/UserInfoHeader';

const CreateExtraChartScreen = () => {
  const navigation = useNavigation();
  const { userData, refreshUserData } = useUser();

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
  const [isAnyProcessing, setIsAnyProcessing] = useState(false);
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    actions: [],
    extraContent: null,
    loading: false
  });

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
    if (!userData || userData.astral_tokens < 50) {
      setMessageModal({
        visible: true,
        title: 'Tokens Insuficientes',
        message: 'Você precisa de 50 Astral Tokens para criar um mapa extra.',
        type: 'error',
        loading: false,
        actions: [
          {
            text: 'Comprar Tokens',
            primary: true,
            onPress: () => {
              setMessageModal(prev => ({ ...prev, visible: false }));
              navigation.navigate('AstralTokens');
            }
          },
          {
            text: 'Cancelar',
            onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });
      return;
    }

    setMessageModal({
      visible: true,
      title: 'Confirmar Criação',
      message: 'Você irá gastar 50 Astral Tokens para criar um novo mapa astral. Deseja continuar?',
      type: 'info',
      loading: false,
      actions: [
        {
          text: 'Confirmar',
          primary: true,
          onPress: () => {
            setMessageModal(prev => ({ ...prev, visible: false }));
            processCreateChart();
          }
        },
        {
          text: 'Cancelar',
          onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
        }
      ],
      extraContent: (
        <View style={styles.modalTokensContainer}>
          <View style={styles.tokensInfo}>
            <Text style={styles.tokensLabel}>Seu novo saldo será de</Text>
            <TouchableOpacity style={styles.tokensContainer}>
              <Text style={styles.tokensText}>{Math.max(0, (userData?.astral_tokens || 0) - 50)}</Text>
              <Image 
                source={require('../assets/images/moeda.png')}
                style={styles.tokenIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      )
    });
  };

  const processCreateChart = async () => {
    setIsAnyProcessing(true);
    setLoadingMessage('Processando...');

    try {
      const token = await StorageService.getAccessToken();
      const response = await api.post('users/create-extra-chart', {
        name: nome,
        birth_day: birthDate.getDate(),
        birth_month: birthDate.getMonth() + 1,
        birth_year: birthDate.getFullYear(),
        birth_hour: birthTime.getHours(),
        birth_minute: birthTime.getMinutes(),
        birth_city: birthCity,
        birth_state: birthCity.split(',')[1]?.trim() || '',
        birth_country: birthCity.split(',')[2]?.trim() || 'Brasil'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        await refreshUserData();
        navigation.navigate('HomeScreen', { 
          screen: 'Mapa Astral', 
          params: { astralMap: response.data.astral_map }
        });
      } else {
        throw new Error(response.data.message || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      console.log(error.response?.data);
      setMessageModal({
        visible: true,
        title: 'Erro',
        message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
        type: 'error',
        loading: false,
        actions: [
          {
            text: 'OK',
            primary: true,
            onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });
    } finally {
      setIsAnyProcessing(false);
      setLoadingMessage('');
    }
  };

  return (
    <View style={styles.container}>
      {memoStars}
      <UserInfoHeader />

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
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Gerar Mapa Astral"
              onPress={handleSubmit}
              icon="auto-awesome"
              style={styles.customButton}
            />
            <View style={styles.tokenChip}>
              <Text style={styles.tokenChipText}>50</Text>
              <Image 
                source={require('../assets/images/moeda.png')}
                style={styles.tokenIcon}
              />
            </View>
          </View>
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

      <MessageModal
        visible={messageModal?.visible}
        title={messageModal?.title}
        message={messageModal?.message}
        type={messageModal?.type}
        loading={messageModal?.loading}
        actions={messageModal?.actions}
        extraContent={messageModal?.extraContent}
        onClose={() => setMessageModal(prev => ({ ...prev, visible: false }))}
      />
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
  modalTokensContainer: {
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  tokensInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.MEDIUM,
  },
  tokensContainer: {
    backgroundColor: '#2A2A2A',
    padding: SPACING.MEDIUM,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    flexDirection: 'row',
    gap: 4,
  },
  tokensText: {
    color: '#FFD700',
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  tokensLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONTS.SIZES.MEDIUM,
    textAlign: 'center',
  },
  tokenIcon: {
    width: 14,
    height: 14,
  },
  buttonContainer: {
    position: 'relative',
  },
  tokenChip: {
    position: 'absolute',
    right: SPACING.MEDIUM,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: '#2A2A2A',
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: SPACING.TINY,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tokenChipText: {
    color: '#FFD700',
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
});
