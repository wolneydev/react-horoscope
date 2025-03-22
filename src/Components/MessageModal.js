import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const MessageModal = ({ 
  visible, 
  title, 
  message, 
  onClose, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  actions = [],
  animationDuration = 300,
  extraContent = null,
  loading = false
}) => {
  const [modalAnimation] = React.useState(new Animated.Value(0));
  const [backgroundOpacity] = React.useState(new Animated.Value(0));
  const [isContentReady, setIsContentReady] = React.useState(!loading);

  React.useEffect(() => {
    if (!loading && visible) {
      // Quando o loading terminar, mostrar o conteúdo após um breve delay
      const timer = setTimeout(() => {
        setIsContentReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!visible) {
      // Resetar o estado quando o modal for fechado
      setIsContentReady(!loading);
    }
  }, [loading, visible]);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(modalAnimation, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnimation, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, modalAnimation, backgroundOpacity, animationDuration]);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#FF4444';
      case 'warning':
        return '#FFC107';
      case 'info':
        return '#2196F3';
      default:
        return '#2196F3';
    }
  };

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: backgroundOpacity }
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ translateY: modalTranslateY }] }
              ]}
            >
              {loading || !isContentReady ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                  <Text style={styles.loadingText}>Carregando...</Text>
                </View>
              ) : (
                <ScrollView 
                  contentContainerStyle={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  <View style={styles.iconContainer}>
                    <Icon name={getIconName()} size={40} color={getIconColor()} />
                  </View>
                  
                  <Text style={styles.title}>{title}</Text>
                  
                  {message && <Text style={styles.message}>{message}</Text>}
                  
                  {extraContent && (
                    <View style={styles.extraContentContainer}>
                      {extraContent}
                    </View>
                  )}
                  
                  <View style={styles.actionsContainer}>
                    {actions.length > 0 ? (
                      actions.map((action, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.actionButton,
                            action.primary && styles.primaryActionButton,
                            action.style
                          ]}
                          onPress={() => {
                            if (action.onPress) action.onPress();
                            if (!action.keepOpen) onClose();
                          }}
                        >
                          <Text 
                            style={[
                              styles.actionText,
                              action.primary && styles.primaryActionText,
                              action.textStyle
                            ]}
                          >
                            {action.text}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.primaryActionButton]}
                        onPress={onClose}
                      >
                        <Text style={[styles.actionText, styles.primaryActionText]}>OK</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxHeight: height * 0.8,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: 20,
    ...SHADOWS.LARGE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  modalContent: {
    padding: SPACING.LARGE,
    alignItems: 'center',
    paddingBottom: SPACING.MEDIUM,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  title: {
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
    width: '100%',
  },
  extraContentContainer: {
    width: '100%',
    marginBottom: SPACING.LARGE,
    maxHeight: height * 0.3,
    overflow: 'hidden',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: SPACING.SMALL,
  },
  actionButton: {
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: 12,
    marginHorizontal: SPACING.SMALL,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryActionButton: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderColor: COLORS.BORDER,
  },
  actionText: {
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  primaryActionText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  loadingContainer: {
    paddingVertical: SPACING.XLARGE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LARGE,
  },
  loadingText: {
    fontSize: FONTS.SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MEDIUM,
  },
});

export default MessageModal;
