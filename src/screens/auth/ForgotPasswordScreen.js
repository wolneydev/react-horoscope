import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedStars from '../../Components/animation/AnimatedStars';
import LoadingOverlay from '../../Components/LoadingOverlay';
import CustomButton from '../../Components/CustomButton';
import api from '../../services/api';
import CustomInput from '../../Components/CustomInput';
import MessageModal from '../../Components/MessageModal';

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
    autoCorrect={false}
  />
);

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    actions: []
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Estado e referência para o contador de reenvio
  const [canResend, setCanResend] = useState(false);
  const [resendCounter, setResendCounter] = useState(60);
  const timerRef = useRef(null);

  const memoizedStars = useMemo(() => <AnimatedStars />, []);

  // Monitorar o estado do teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Iniciar o contador quando o código for enviado
  useEffect(() => {
    if (codeSent) {
      startResendCounter();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [codeSent]);
  
  // Função para iniciar o contador de reenvio
  const startResendCounter = () => {
    setCanResend(false);
    setResendCounter(60);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setResendCounter(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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
      setErrors((prev) => ({ ...prev, email: 'Por favor, insira um email válido' }));
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
        
        // Usando o MessageModal
        setMessageModal({
          visible: true,
          title: 'Sucesso',
          message: 'Código de verificação enviado para seu email!',
          type: 'success'
        });
        
        // Iniciar o contador de reenvio
        startResendCounter();
      }
    } catch (error) {
      setError('Erro ao enviar o código. Tente novamente.');
      console.error(error);
      console.log(error.response?.data);
      
      // Usando o MessageModal para erro
      setMessageModal({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível enviar o código de verificação. Verifique seu email e tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para reenviar o código
  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      setLoading(true);
      const response = await api.post('auth/forgot-password', {
        email: email.trim(),
      });

      if (response.data.status === 'success') {
        setMessageModal({
          visible: true,
          title: 'Código Reenviado',
          message: 'Um novo código de verificação foi enviado para seu email.',
          type: 'success'
        });
        
        // Reiniciar o contador
        startResendCounter();
      }
    } catch (error) {
      setError('Erro ao reenviar o código. Tente novamente.');
      console.error(error);
      
      setMessageModal({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível reenviar o código de verificação.',
        type: 'error'
      });
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
      
      // Exibindo mensagem de erro com o MessageModal
      setMessageModal({
        visible: true,
        title: 'Código Inválido',
        message: 'O código informado não é válido ou expirou. Por favor, tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {memoizedStars}
      
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollViewContent,
              keyboardVisible && styles.scrollViewContentWithKeyboard
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus={true}
                    />
                  </View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  <CustomButton
                    title="Enviar Código"
                    onPress={handleSendCode}
                    disabled={loading}
                    loading={loading}
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
                  
                  {/* Contador de reenvio e botão de reenviar */}
                  <View style={styles.resendContainer}>
                    {resendCounter > 0 ? (
                      <Text style={styles.resendCounterText}>
                        Reenviar código em: {resendCounter}s
                      </Text>
                    ) : (
                      <TouchableOpacity 
                        onPress={handleResendCode}
                        disabled={!canResend || loading}
                        style={[
                          styles.resendButton,
                          (!canResend || loading) && styles.resendButtonDisabled
                        ]}
                      >
                        <Text style={[
                          styles.resendButtonText,
                          (!canResend || loading) && styles.resendButtonTextDisabled
                        ]}>
                          Reenviar código
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  <CustomButton
                    title="Verificar Código"
                    onPress={handleVerifyCode}
                    disabled={loading}
                    loading={loading}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus={true}
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <CustomButton
                  title="Enviar Código"
                  onPress={handleSendCode}
                  disabled={loading}
                  loading={loading}
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
                
                {/* Contador de reenvio e botão de reenviar */}
                <View style={styles.resendContainer}>
                  {resendCounter > 0 ? (
                    <Text style={styles.resendCounterText}>
                      Reenviar código em: {resendCounter}s
                    </Text>
                  ) : (
                    <TouchableOpacity 
                      onPress={handleResendCode}
                      disabled={!canResend || loading}
                      style={[
                        styles.resendButton,
                        (!canResend || loading) && styles.resendButtonDisabled
                      ]}
                    >
                      <Text style={[
                        styles.resendButtonText,
                        (!canResend || loading) && styles.resendButtonTextDisabled
                      ]}>
                        Reenviar código
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <CustomButton
                  title="Verificar Código"
                  onPress={handleVerifyCode}
                  disabled={loading}
                  loading={loading}
                />
              </View>
            )}
          </View>
        </ScrollView>
      )}
      
      {/* MessageModal */}
      <MessageModal
        visible={messageModal.visible}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        actions={messageModal.actions}
        onClose={() => setMessageModal(prev => ({ ...prev, visible: false }))}
      />
      
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
    justifyContent: 'center',
  },
  scrollViewContentWithKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  content: {
    flex: 1,
    padding: 20,
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
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  // Estilos para o contador e botão de reenvio
  resendContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resendCounterText: {
    color: '#7A708E',
    fontSize: 14,
    textAlign: 'center',
  },
  resendButton: {
    padding: 10,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#6D44FF',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: '#7A708E',
  },
}); 