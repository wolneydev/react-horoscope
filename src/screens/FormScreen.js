import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import api from '../services/api';

const theme = {
  colors: {
    background: '#1E1B29',
    textPrimary: '#F9F8F8',
    textSecondary: '#C9BBCF',
    accent: '#FFD700',
    inputBackground: '#2C2840',
  },
  spacing: 16,
};

const FormScreen = ({ navigation }) => {
  const isAndroid = Platform.OS === 'android';

  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());
  const [isButtonVisible, setButtonVisible] = useState(true); // Estado para controlar a visibilidade do botão

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleConfirmDate = (selectedDate) => {
    setBirthDate(selectedDate);
    hideDatePicker();
  };

  const handleConfirmTime = (selectedTime) => {
    setBirthTime(selectedTime);
    hideTimePicker();
  };

  const formatSelectedDate = (date) => {
    if (!date) return 'Escolher Data';
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatSelectedTime = (date) => {
    if (!date) return 'Escolher Horário';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };

  const handleSubmit = async () => {
    setButtonVisible(false); // Oculta o botão ao ser clicado

    try {
      const payload = {
        city: city.trim(),
        year: birthDate.getFullYear(),
        month: birthDate.getMonth() + 1,
        day: birthDate.getDate(),
        hour: birthTime.getHours(),
        minute: birthTime.getMinutes(),
      };

      const response = await api.post('astralmap', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const json = response.data;
      if (json.status === 'success') {
        navigation.navigate('AstralMapScreen', { astralMap: json.data.astral_map });
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao gerar o mapa astral.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro na requisição', 'Verifique o console para mais detalhes.');
      setButtonVisible(true); // Torna o botão visível novamente em caso de erro
    }
  };

  const StyledInput = ({ label, value, onChangeText, placeholder }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );

  const DateButton = ({ label, onPress, value }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateButton} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.dateButtonText}>{value}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Preencha seus dados</Text>

      <StyledInput
        label="Informe a cidade de nascimento:"
        value={city}
        onChangeText={setCity}
        placeholder="Ex: São Paulo"
      />

      <DateButton
        label="Selecione a data de nascimento:"
        onPress={showDatePicker}
        value={formatSelectedDate(birthDate)}
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={birthDate}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        is24Hour={isAndroid}
      />

      <DateButton
        label="Selecione o horário de nascimento:"
        onPress={showTimePicker}
        value={formatSelectedTime(birthTime)}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        date={birthTime}
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
        is24Hour={isAndroid}
      />

      {isButtonVisible && ( // Renderiza o botão apenas se isButtonVisible for true
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Gerar Mapa Astral</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing,
  },
  title: {
    fontSize: 22,
    marginBottom: theme.spacing,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  inputContainer: {
    marginBottom: theme.spacing,
  },
  label: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  dateButton: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 4,
    padding: 12,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: theme.spacing,
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FormScreen;
