// src/screens/FormScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform, // Import para detectar a plataforma
  Alert,
} from 'react-native';

import DateTimePickerModal from 'react-native-modal-datetime-picker';

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

  // Formatação simples (sem zero à esquerda)
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
    return `${hours}:${minutes}`;
  };

  // Função que chama a API
  const handleSubmit = async () => {
    try {
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      const hour = birthTime.getHours();
      const minute = birthTime.getMinutes();

      // Exemplo de detecção de plataforma (caso queira personalizar o body):
      let platformMsg = isAndroid ? 'Enviando do Android...' : 'Enviando do iOS...';
      console.log(platformMsg);

      const response = await fetch('https://api.match.diegoqueiroz.dev/v1/astralmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city.trim(),
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day, 10),
          hour: parseInt(hour, 10),
          minute: parseInt(minute, 10),
        }),
      });

      const json = await response.json();
      if (json.status === 'success') {
        // Navega para a tela AstralMapScreen, passando os dados
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
      keyboardShouldPersistTaps="handled" // Importante no Android
    >
      <Text style={styles.title}>Preencha seus dados</Text>

      {/* Campo de texto para cidade */}
      <Text style={styles.label}>Informe a cidade de nascimento:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: São Paulo"
        value={city}
        onChangeText={setCity}
      />

      {/* Botão e modal para data de nascimento */}
      <Text style={styles.label}>Selecione a data de nascimento:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={showDatePicker}
        activeOpacity={0.7}
      >
        <Text style={styles.dateButtonText}>
          {formatSelectedDate(birthDate) || 'Escolher Data'}
        </Text>
      </TouchableOpacity>
      {/** 
       *   No iOS e no Android, o mesmo componente funciona. 
       *   Se quiser comportamentos distintos, 
       *   você pode fazer if(isAndroid) ou if(isIOS) em alguma prop. 
       */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={birthDate}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        // Exemplo: no Android costuma mostrar 24h por padrão
        is24Hour={isAndroid}
      />

      {/* Botão e modal para hora de nascimento */}
      <Text style={styles.label}>Selecione o horário de nascimento:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={showTimePicker}
        activeOpacity={0.7}
      >
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
        // Ajuste do formato de 24 horas baseado na plataforma
        is24Hour={isAndroid}
      />

      {/* Botão para submeter o formulário */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gerar Mapa Astral</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Estilos de exemplo
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
