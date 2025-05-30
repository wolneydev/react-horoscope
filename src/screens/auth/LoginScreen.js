import React, { useState, useEffect, useMemo } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedStars from '../../Components/animation/AnimatedStars';
import LoadingOverlay from '../../Components/LoadingOverlay';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import MessageModal from '../../Components/MessageModal';

import api from '../../services/api';
import StorageService from '../../store/store';
import CryptoService from '../../services/crypto';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    actions: []
  });

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  useEffect(() => {
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Verificando logins anteriores ...');
      const accessToken = await StorageService.getAccessToken();
      const userData = await StorageService.getUserData();
      
      if (accessToken && userData) {
        navigation.replace('HomeScreen');
      }
    } catch (error) {
      console.error('Erro ao verificar login:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    // Validação do email
    if (!email || !email.trim()) {
      tempErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Email inválido';
      isValid = false;
    }

    // Validação da senha
    if (!password || !password.trim()) {
      tempErrors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (password.length < 6) {
      tempErrors.password = 'Senha deve ter no mínimo 6 caracteres';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      return;
    }

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
          email_verified_at: data.email_verified_at,
          encryptedPassword,
          extra_maps_max_number: data.extra_maps_max_number,
          has_profile_photo: data.has_profile_photo,
          profile_photo_url: data.profile_photo_url,
          has_contacts: data.has_contacts,
          contacts: data.contacts,
          sign: data.sun.sign.name,
          astral_tokens: data.astral_tokens,
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
        await StorageService.saveAstralMaps(data.astral_maps);

        setLoadingMessage('Entrando...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        navigation.replace('HomeScreen');
      }
    } catch (error) {
      console.error('Erro:', error);
      
      // Substituindo o Alert.alert pelo MessageModal
      setMessageModal({
        visible: true,
        title: 'Erro de Login',
        message: 'Email ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <View style={styles.container}>
      {memoStars}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Bem-vindo(a) de volta!</Text>
            <Text style={styles.subtitle}>
              Acesse seu destino astral e descubra o que as estrelas reservam para você
            </Text>

            <View style={styles.form}>
              <View>
                <CustomInput
                  icon="email"
                  placeholder="E-mail"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  keyboardType="email-address"
                  error={errors.email}
                />
              </View>

              <View>
                <CustomInput
                  icon="lock"
                  placeholder="Senha"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  secureTextEntry
                  error={errors.password}
                />
              </View>

              <CustomButton
                title="Entrar"
                onPress={handleSubmit}
                disabled={loading}
                loading={loading}
              />

              <TouchableOpacity 
                onPress={() => navigation.navigate('ForgotPasswordScreen')}
                style={styles.forgotPasswordButton}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate('RegisterScreen')}
                style={styles.linkButton}
                disabled={loading}
              >
                <Text style={styles.linkText}>
                  Ainda não tem uma conta? <Text style={styles.linkTextHighlight}>Cadastre-se</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* MessageModal */}
      <MessageModal
        visible={messageModal.visible}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        actions={messageModal.actions}
        onClose={() => setMessageModal(prev => ({ ...prev, visible: false }))}
      />
      
      {loading && <LoadingOverlay message={loadingMessage} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(109, 68, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A708E',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    gap: 10,
    marginTop: 30,
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
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordButton: {
    marginTop: 20,
    alignItems: 'center',    
  },
  forgotPasswordText: {
    color: '#6D44FF',
    fontSize: 14,
    fontWeight: '500',
  },
  linkButton: {
    alignItems: 'center',    
  },
  linkText: {
    color: '#7A708E',
    fontSize: 14,
  },
  linkTextHighlight: {
    color: '#6D44FF',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
});