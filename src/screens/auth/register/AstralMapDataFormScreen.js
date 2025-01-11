// src/screens/auth/register/AstralMapDataFormScreen.js
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Alert,
  ImageBackground,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import api from '../../../services/api';

export default function AstralMapDataFormScreen({ navigation }) {
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';

  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState();
  const [birthTime, setBirthTime] = useState();

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
        navigation.navigate('AstralMapScreen', { astralMap: json.data.astral_map });
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao gerar o mapa astral.');
      }
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
            placeholder="Informe a cidade de nascimento"
            placeholderTextColor="#7A708E"
            value={city}
            onChangeText={setCity}
          />

          oi<TouchableOpacity style={styles.dateButton} onPress={showDatePicker} activeOpacity={0.7}>
            <Text style={styles.dateButtonText}>
              {formatSelectedDate(birthDate) || 'Selecione a Data de Nascimento'}
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

          <TouchableOpacity style={styles.dateButton} onPress={showTimePicker} activeOpacity={0.7}>
            <Text style={styles.dateButtonText}>
              {formatSelectedTime(birthTime) || 'Selecione o horário de nascimento'}
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
        </View>
        <View style={styles.section30}>
          <Text style={styles.sectionText}>Colocar um gif animado qualquer aqui. uma constelaçãozinha gitando uma mandala qq zorra</Text>
          <Text style={styles.sectionText}>Vamos te conhecer melhor!</Text>
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
});
