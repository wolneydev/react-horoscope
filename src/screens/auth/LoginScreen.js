import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
  ImageBackground,
} from 'react-native';
import api from '../../services/api';
import StorageService from '../../store/store';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await api.post(
        'auth/login',
        {
          email: email.trim(),
          password: password.trim(),
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
      Alert.alert('Erro', 'Email ou senha incorretos');
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/starry-night2.jpg')} 
        style={styles.section}
      >
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            Bem-vindo(a) de volta ao seu destino astral!
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#7A708E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#7A708E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSubmit} 
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('RegisterScreen')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Ainda não tem uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  sectionDescription: {
    fontSize: 18,
    color: '#F9F8F8',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#2C2840',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#F9F8F8',
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: '#1E1B29',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#FFD700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});