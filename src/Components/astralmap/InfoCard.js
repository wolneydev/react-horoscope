import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatBirthDate } from '../../utils/helpers';

const InfoCard = ({ astralMap }) => {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconContainer}>
        <Icon name="auto-awesome" size={24} color="#6D44FF" />
      </View>
      <Text style={styles.infoCardTitle}>Mapa Astral de</Text>
      <Text style={styles.infoCardName}>{astralMap.astral_map_name}</Text>
      <Text style={styles.infoCardDescription}>
        O mapa astral, ou carta natal, é um retrato do céu no momento exato do seu nascimento.
        Ele revela suas características pessoais, talentos naturais e desafios de vida.
      </Text>
      <Text style={styles.infoCardBirthData}>
        {formatBirthDate(astralMap)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#121629',
    borderWidth: 1,
    borderColor: '#272343',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  infoIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoCardName: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  infoCardBirthData: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'right',
    fontStyle: 'italic',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  infoCardDescription: {
    color: '#bbb',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
});

export default InfoCard;
