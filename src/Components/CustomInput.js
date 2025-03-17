import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, INPUT_STYLES } from '../styles/theme';

const CustomInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  error,
  autoCapitalize = 'none',
  disabled = false,
  onFocus: externalOnFocus,
  onBlur: externalOnBlur,
  autoFocus = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Pequeno atraso para garantir que o componente esteja totalmente montado
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (externalOnFocus) externalOnFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (externalOnBlur) externalOnBlur(e);
  };

  return (
    <View>
      <View 
        style={[
          styles.inputContainer, 
          isFocused && styles.inputContainerFocused,
          disabled && styles.inputContainerDisabled,
          error && styles.inputContainerError
        ]}
      >
        {icon && <Icon name={icon} size={20} color="#7A708E" />}
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#7A708E"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          autoCorrect={false}
          spellCheck={false}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Icon 
              name={isPasswordVisible ? "visibility" : "visibility-off"} 
              size={20} 
              color="#7A708E" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: INPUT_STYLES.CONTAINER,
  inputContainerFocused: INPUT_STYLES.FOCUS,
  inputContainerDisabled: INPUT_STYLES.DISABLED,
  inputContainerError: {
    borderColor: COLORS.ERROR,
  },
  input: INPUT_STYLES.TEXT,
  errorText: INPUT_STYLES.ERROR,
  eyeIcon: {
    padding: 10,
  },
});

export default CustomInput; 