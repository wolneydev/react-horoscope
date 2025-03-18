import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedStars from '../../Components/animation/AnimatedStars';
import LoadingOverlay from '../../Components/LoadingOverlay';
import CustomButton from '../../Components/CustomButton';
import api from '../../services/api';
import CustomInput from '../../Components/CustomInput';
import MessageModal from '../../Components/MessageModal';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email, code } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    actions: []
  });

  const memoizedStars = useMemo(() => <AnimatedStars />, []);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    // Regex simplificado sem exigência de caracteres especiais, mas permitindo-os
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    if (!passwordRegex.test(newPassword)) {
      setError(
        'A senha deve conter pelo menos:\n' +
        '- Uma letra maiúscula\n' +
        '- Uma letra minúscula\n' +
        '- Um número'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('auth/reset-password', {
        email: email.trim(),
        token: code.trim(),
        password: newPassword.trim(),
        password_confirmation: confirmPassword.trim(),
      });

      if (response.data.status === 'success') {
        // Log para depuração
        console.log('Senha alterada com sucesso, exibindo modal');
        
        // Garantir que o modal seja realmente exibido
        setTimeout(() => {
          setMessageModal({
            visible: true,
            title: 'Sucesso',
            message: 'Senha alterada com sucesso',
            type: 'success',
            actions: [
              {
                text: 'Fazer Login',
                primary: true,
                onPress: () => navigation.navigate('LoginScreen')
              }
            ]
          });
        }, 100);
      }
    } catch (error) {
      setError('Erro ao redefinir a senha. Tente novamente.');
      console.error(error);
      console.log(error.response.data);
      
      setMessageModal({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível redefinir sua senha. Por favor, tente novamente mais tarde.',
        type: 'error'
      });
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
            <Text style={styles.title}>Nova Senha</Text>
            <Text style={styles.subtitle}>
              Digite sua nova senha
            </Text>

            <View style={styles.form}>
              <View>
                <CustomInput
                  icon="lock"
                  placeholder="Nova senha"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError('');
                  }}
                  secureTextEntry={!showNewPassword}
                  error={error}
                />
              </View>

              <View>
                <CustomInput
                  icon="lock-outline"
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
              </View>

              <CustomButton
                title="Redefinir Senha"
                onPress={handleResetPassword}
                disabled={loading}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <MessageModal
        visible={messageModal.visible}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        actions={messageModal.actions}
        onClose={() => {
          setMessageModal(prev => ({ ...prev, visible: false }));
          
          // Se for o modal de sucesso, redirecionar para a tela de login
          if (messageModal.type === 'success') {
            setTimeout(() => {
              navigation.navigate('LoginScreen');
            }, 100);
          }
        }}
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
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  eyeIcon: {
    padding: 10,
  },
}); 