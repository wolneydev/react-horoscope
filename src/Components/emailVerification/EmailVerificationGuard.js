import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StorageService from '../../store/store';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../../styles/theme';

const EmailVerificationGuard = ({ children }) => {
  const navigation = useNavigation();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userData, setUserData] = useState(null);

  // Usando useFocusEffect para executar sempre que a tela receber foco
  useFocusEffect(
    useCallback(() => {
      const checkEmailVerification = async () => {
        try {
          const userData = await StorageService.getUserData();
          setUserData(userData);
          
          if (!userData?.email_verified_at) {
            setShowVerificationModal(true);
          } else {
            setShowVerificationModal(false);
          }
        } catch (error) {
          console.error('Erro ao verificar email:', error);
          setShowVerificationModal(false);
        }
      };
      
      checkEmailVerification();
    }, [])
  );

  return (
    <View style={styles.container}>
      {children}
      
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.warningCard}>
            <View style={styles.warningIconContainer}>
              <Icon name="warning" size={24} color={COLORS.WARNING} />
            </View>
            <Text style={styles.warningCardTitle}>Verificação Necessária</Text>
            <Text style={styles.warningCardDescription}>
              Por favor, verifique seu email para acessar esta funcionalidade.
            </Text>
            <Text style={styles.warningCardDescription}>
              Enviamos um email para {userData?.email}.
            </Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => {
                setShowVerificationModal(false);
                navigation.navigate('HomeScreen', { screen: 'Home' });
              }}
            >
              <Text style={styles.buttonText}>Voltar para Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 21, 39, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.SMALL,
  },
  warningCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    width: '90%',
    maxWidth: 400,
    elevation: 5,
  },
  warningIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: SPACING.SMALL,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.MEDIUM,
  },
  warningCardTitle: {
    color: COLORS.WARNING,
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginTop: SPACING.MEDIUM,
  },
  warningCardDescription: {
    color: COLORS.WARNING,
    fontSize: FONTS.SIZES.MEDIUM,
    marginTop: SPACING.TINY,
    marginBottom: SPACING.MEDIUM,
    opacity: 0.8,
    textAlign: 'left',
  },
  button: {
    backgroundColor: COLORS.WARNING,
    borderRadius: 12,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
  },
  buttonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
  }
});

export default EmailVerificationGuard; 