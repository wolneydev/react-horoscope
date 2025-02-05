import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomButton = ({ 
  onPress, 
  title, 
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
  icon = null,
  iconSize = 20,
  iconColor = '#FFFFFF',
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.buttonWrapper,
        disabled && styles.buttonDisabled,
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <Icon 
            name={icon} 
            size={iconSize} 
            color={iconColor} 
            style={styles.icon}
          />
        )}
        <Text style={[styles.buttonText, textStyle]}>
          {loading ? 'Carregando...' : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(109, 68, 255, 0.25)', 
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.75)',
    overflow: 'hidden',
    marginBottom: 0,
  },
  
  buttonContent: {
    paddingVertical: 16,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 0.5,
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },

  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: '#4A4A4A',
  },

  icon: {
  },
});

export default CustomButton;