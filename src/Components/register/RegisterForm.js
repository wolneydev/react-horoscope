import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CustomButton from '../../Components/CustomButton';
import CityAutoComplete from '../../Components/CityAutoComplete';

const RegisterForm = ({
  nome,
  setNome,
  email,
  setEmail,
  password,
  setPassword,
  passwordConfirmation,
  setPasswordConfirmation,

  birthCity,
  setBirthCity,
  setBirthLatitude,
  setBirthLongitude,

  birthDate,
  birthTime,
  showDatePicker,
  showTimePicker,
  formatSelectedDate,
  formatSelectedTime,

  errors,
  isLoading,

  onSubmit,
  onNavigateToLogin,
}) => {
  // Subcomponente para exibir a mensagem de erro
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <View style={styles.form}>
      {/* Nome */}
      <View>
        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#7A708E" />
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#7A708E"
            value={nome}
            onChangeText={(text) => setNome(text)}
          />
        </View>
        <ErrorMessage error={errors.nome} />
      </View>

      {/* Cidade de nascimento e coordenadas de nascimento */}
      <View>
        <View style={styles.inputContainer}>
          <Icon name="location-city" size={20} color="#7A708E" />
          <CityAutoComplete
            placeholderTextColor="#7A708E"
            onCitySelected={(cityObj) => {
              setBirthCity(cityObj.city);
              setBirthLatitude(cityObj.latitude);
              setBirthLongitude(cityObj.longitude);
            }}
            style={styles.input}
          />
        </View>
        <ErrorMessage error={errors.city} />
      </View>

      {/* Data de nascimento */}
      <View>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={showDatePicker}
        >
          <Icon name="calendar-today" size={20} color="#7A708E" />
          <Text style={[styles.dateText, !birthDate && styles.placeholder]}>
            {birthDate ? formatSelectedDate(birthDate) : 'Data de nascimento'}
          </Text>
        </TouchableOpacity>
        <ErrorMessage error={errors.birthDate} />
      </View>

      {/* Hora de nascimento */}
      <View>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={showTimePicker}
        >
          <Icon name="access-time" size={20} color="#7A708E" />
          <Text style={[styles.dateText, !birthTime && styles.placeholder]}>
            {birthTime ? formatSelectedTime(birthTime) : 'Horário de nascimento'}
          </Text>
        </TouchableOpacity>
        <ErrorMessage error={errors.birthTime} />
      </View>

      {/* Email */}
      <View>
        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#7A708E" />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#7A708E"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <ErrorMessage error={errors.email} />
      </View>

      {/* Senha */}
      <View>
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#7A708E" />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#7A708E"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />
        </View>
        <ErrorMessage error={errors.password} />
      </View>

      {/* Confirmar senha */}
      <View>
        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color="#7A708E" />
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor="#7A708E"
            value={passwordConfirmation}
            onChangeText={(text) => setPasswordConfirmation(text)}
            secureTextEntry
          />
        </View>
        <ErrorMessage error={errors.password_confirmation} />
      </View>

      {/* Botão de criar conta */}
      <CustomButton
        title="Gerar meu Mapa Astral!"
        onPress={onSubmit}
        disabled={isLoading}
        loading={isLoading}
        style={styles.customButton}
      />

      {/* Link para Login */}
      <TouchableOpacity
        onPress={onNavigateToLogin}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>
          Já tem uma conta?{' '}
          <Text style={styles.linkTextHighlight}>Faça login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 0,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  dateText: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  placeholder: {
    color: '#7A708E',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  customButton: {
    marginVertical: 5,
  },
  linkButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
  },
  linkText: {
    color: '#7A708E',
    fontSize: 14,
  },
  linkTextHighlight: {
    color: '#6D44FF',
    fontWeight: 'bold',
  },
});

export default RegisterForm;
