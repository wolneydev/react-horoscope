import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedStars from '../../Components/animation/AnimatedStars';
import LoadingOverlay from '../../Components/LoadingOverlay';
import CustomButton from '../../Components/CustomButton';
import api from '../../services/api';

const CodeInput = ({ value, onChange, index }) => (
  <TextInput
    style={styles.codeInput}
    value={value}
    onChangeText={(text) => {
      // Se o texto colado for maior que 1, provavelmente é um código completo
      if (text.length > 1) {
        const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
        if (cleanText.length === 6) {
          onChange(cleanText, 'paste');
          return;
        }
      }
      // Caso contrário, é uma digitação normal
      onChange(text, index);
    }}
    keyboardType="number-pad"
    maxLength={6} // Aumentado para permitir colar
    selectTextOnFocus
  />
);

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const memoizedStars = useMemo(() => <AnimatedStars />, []);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
      
      if (cleanText.length === 6) {
        const newCode = cleanText.split('');
        setVerificationCode(newCode);
      }
    } catch (error) {
      console.log('Erro ao colar:', error);
    }
  };

  const handleCodeChange = (text, indexOrAction) => {
    if (indexOrAction === 'paste') {
      // Se for uma ação de colar, distribui os números
      const newCode = text.split('');
      setVerificationCode(newCode);
    } else {
      // Se for digitação normal
      const newCode = [...verificationCode];
      newCode[indexOrAction] = text;
      setVerificationCode(newCode);
    }
  };

  const handleSendCode = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    try {
      setLoading(true);
      // Aqui você deve implementar a chamada API para enviar o código
      const response = await api.post('auth/forgot-password', {
        email: email.trim(),
      });

      if (response.data.status === 'success') {
        setCodeSent(true);
        setError('');
        Alert.alert('Sucesso', 'Código de verificação enviado para seu email');
      }
    } catch (error) {
      setError('Erro ao enviar o código. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Por favor, insira o código completo');
      return;
    }

    try {
      setLoading(true);
      console.log(email.trim());
      // Aqui você deve implementar a chamada API para verificar o código
      const response = await api.post('auth/verify-forgot-password-token', {
        email: email.trim(),
        token: code,
      });

      console.log(response.data);
      if (response.data.status === 'success') {
        navigation.navigate('ResetPasswordScreen', {
          email,
          code,
        });
      }
    } catch (error) {
      setError('Código inválido. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {memoizedStars}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>
              {codeSent ? 'Verificar Código' : 'Recuperar Senha'}
            </Text>
            <Text style={styles.subtitle}>
              {codeSent
                ? 'Digite o código de 6 dígitos enviado para seu email'
                : 'Insira seu email para receber o código de recuperação'}
            </Text>

            {!codeSent ? (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color="#7A708E" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#7A708E"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <CustomButton
                  title="Enviar Código"
                  onPress={handleSendCode}
                  disabled={loading}
                  loading={loading}
                  style={styles.customButton}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.codeContainer}>
                  {verificationCode.map((digit, index) => (
                    <CodeInput
                      key={index}
                      value={digit}
                      onChange={handleCodeChange}
                      index={index}
                    />
                  ))}
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <CustomButton
                  title="Verificar Código"
                  onPress={handleVerifyCode}
                  disabled={loading}
                  loading={loading}
                  style={styles.customButton}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {loading && <LoadingOverlay />}
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
    gap: 15,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
  },
  customButton: {
    marginVertical: 5,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
}); 