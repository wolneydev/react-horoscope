import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import api from '../../services/api';
import StorageService from '../../store/store';
import CryptoService from '../../services/crypto';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('dibs@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Conectando...');

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

      if (status === 'success') {
        setLoadingMessage('Preparando seus dados...');
        
        const encryptedPassword = CryptoService.encrypt(password);
        const userData = {
          name: data.name,
          email: data.email,
          uuid: data.uuid,
          encryptedPassword,
          birthData: {
            city: data.birth_city,
            year: data.birth_year,
            month: data.birth_month,
            day: data.birth_day,
            hour: data.birth_hour,
            minute: data.birth_minute
          }
        };

        await StorageService.saveUserData(userData);
        await StorageService.saveAccessToken(data.access_token);
        await StorageService.saveAstralMap(data.astral_map);

        setLoadingMessage('Entrando...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        navigation.replace('HomeScreen');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Email ou senha incorretos');
    } finally {
      setLoading(false);
      setLoadingMessage('');
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
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#7A708E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit} 
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          {loading && (
            <>
              <ActivityIndicator 
                style={styles.loader} 
                color="#FFD700" 
                size="small" 
              />
              <Text style={styles.loadingText}>{loadingMessage}</Text>
            </>
          )}

          <TouchableOpacity 
            onPress={() => navigation.navigate('RegisterScreen')}
            style={styles.linkButton}
            disabled={loading}
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
  buttonDisabled: {
    opacity: 0.7,
  },
  loader: {
    marginTop: 10,
  },
  loadingText: {
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
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