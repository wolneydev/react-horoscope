import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, FONTS } from '../../styles/theme';

const EmailVerificationCard = ({ 
  userData, 
  canResendEmail, 
  resendCounter, 
  shakeAnimation,
  onlyShowIfVerified
}) => {
  if (!userData) return null;
  
  // Se o email já foi verificado, não mostra nada
  if (userData.email_verified_at) {
    return null;
  }
  
  // Se o email não foi verificado, mostra o card de aviso com animação
  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
      <View 
        style={[
          styles.warningCard,
          !canResendEmail && styles.warningCardDisabled
        ]}
      >
        <View style={styles.warningIconContainer}>
          <Icon name="warning" size={24} color={COLORS.WARNING} />
        </View>
        <Text style={styles.warningCardTitle}>Verifique seu Email</Text>
        <Text style={styles.warningCardDescription}>
          Enviamos um email para {userData?.email}.
        </Text>
        <Text style={styles.warningCardDescription}>
          Por favor, verifique sua caixa de entrada e siga as instruções para ativar sua conta.
        </Text>              
        <Text style={[
          styles.warningCardAction,
          !canResendEmail && styles.warningCardActionDisabled
        ]}>
          {canResendEmail 
            ? 'Reenviar email de verificação'
            : `Aguarde ${resendCounter}s para reenviar`
          }
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  warningCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
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
  warningCardAction: {
    color: COLORS.WARNING,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.BOLD,
    textDecorationLine: 'underline',
    marginTop: SPACING.TINY,
  },
  warningCardDisabled: {
    opacity: 0.7,
  },
  warningCardActionDisabled: {
    opacity: 0.5,
  },
});

export default EmailVerificationCard; 