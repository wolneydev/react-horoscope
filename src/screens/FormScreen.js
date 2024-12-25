// src/screens/FormScreen.js
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

export default function FormScreen({ navigation }) {
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';

  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());

  // Controle do modal de Data
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Controle do modal de Hora
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

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

      let platformMsg = isAndroid ? 'Enviando do Android...' : 'Enviando do iOS...';
      console.log(platformMsg);

      const response = await api.post(
        'astralmap',
        {
          city: city.trim(),
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day, 10),
          hour: parseInt(hour, 10),
          minute: parseInt(minute, 10),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const json = response.data;

      if (json.status === 'success') {
        navigation.navigate('AstralMapScreen', { astralMap: json.data.data });
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao gerar o mapa astral.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro na requisição', 'Verifique o console para mais detalhes.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="always"
    >
      <Text style={styles.title}>Preencha seus dados</Text>

      <Text style={styles.label}>Informe a cidade de nascimento:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: São Paulo"
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

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gerar Mapa Astral</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Estilos de tema noturno/astral:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B29', // Fundo escuro remetendo ao céu noturno
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
});
