import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { COLORS, INPUT_STYLES } from '../styles/theme';

const CustomDateTimePicker = ({
  icon,
  placeholder,
  value,
  onChange,
  mode = 'date',
  error,
  disabled = false,
  format,
  ...props
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const showPicker = () => {
    if (!disabled) {
      setPickerVisible(true);
    }
  };

  const hidePicker = () => {
    setPickerVisible(false);
  };

  const handleConfirm = (selectedValue) => {
    onChange(selectedValue);
    hidePicker();
  };

  const formatValue = () => {
    if (!value) return '';
    
    if (format) {
      return format(value);
    }
    
    if (mode === 'date') {
      const day = value.getDate();
      const month = value.getMonth() + 1;
      const year = value.getFullYear();
      return `${day}/${month}/${year}`;
    } else if (mode === 'time') {
      const hours = value.getHours();
      const minutes = value.getMinutes();
      return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    }
    
    return value.toString();
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.container,
          disabled && styles.containerDisabled,
          error && styles.containerError
        ]}
        onPress={showPicker}
        disabled={disabled}
      >
        {icon && <Icon name={icon} size={20} color="#7A708E" />}
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? formatValue() : placeholder}
        </Text>
      </TouchableOpacity>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={mode}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        date={value || new Date()}
        themeVariant="dark"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: INPUT_STYLES.CONTAINER,
  containerDisabled: INPUT_STYLES.DISABLED,
  containerError: {
    borderColor: COLORS.ERROR,
  },
  text: {
    ...INPUT_STYLES.TEXT,
    paddingVertical: 15,
  },
  placeholder: {
    color: '#7A708E',
  },
  errorText: INPUT_STYLES.ERROR,
});

export default CustomDateTimePicker; 