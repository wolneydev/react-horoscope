import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

/**
 * Componente para exibir notificações de erro no estilo do tema da aplicação
 * 
 * @param {string} message - Mensagem de erro a ser exibida
 * @param {boolean} visible - Se a notificação deve estar visível
 * @param {function} onDismiss - Função chamada quando a notificação é fechada
 * @param {number} duration - Duração em ms antes de fechar automaticamente (padrão: 5000ms)
 */
const ErrorNotification = ({ 
  message, 
  visible, 
  onDismiss, 
  duration = 5000 
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let dismissTimer;
    
    if (visible) {
      // Animação de entrada
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Timer para fechar automaticamente
      if (duration > 0) {
        dismissTimer = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    } else {
      // Animação de saída
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [visible, duration]);

  const handleDismiss = () => {
    // Animação de saída
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!message) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <Icon name="error-outline" size={24} color="#FF4444" />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Icon name="close" size={20} color="#7A708E" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: 10,
    backgroundColor: 'rgba(20, 21, 39, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 68, 68, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  closeButton: {
    padding: 5,
  },
});

export default ErrorNotification; 