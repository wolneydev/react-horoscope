import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatNumber } from '../../utils/helpers';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../../styles/theme';

const InfoCard = ({ astralMap }) => {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardHeader}>
        <View style={styles.infoIconContainer}>
          <Icon name="auto-awesome" size={24} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.infoCardTitle}>Mapa Astral de</Text>
          <Text style={styles.infoCardName}>{astralMap.astral_map_name}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setIsInfoExpanded(!isInfoExpanded)}
          style={styles.expandButton}
        >
          <Icon 
            name={isInfoExpanded ? "keyboard-arrow-up" : "info-outline"} 
            size={24} 
            color={COLORS.TEXT_TERTIARY} 
          />
        </TouchableOpacity>
      </View>

      {isInfoExpanded && (
        <View style={styles.expandedInfo}>
          <Text style={styles.infoCardDescription}>
            O mapa astral, ou carta natal, é um retrato do céu no momento exato do seu nascimento. Ele revela suas características pessoais, talentos naturais e desafios de vida.
          </Text>
          <View style={styles.infoCardBirthData}>
            <Text style={styles.infoCardData}>Local de Nascimento: {astralMap.birth_city}</Text>
            <Text style={styles.infoCardData}>Data de Nascimento: {formatNumber(astralMap.birth_day)}/{formatNumber(astralMap.birth_month)}/{astralMap.birth_year}</Text>
            <Text style={styles.infoCardData}>Horário de Nascimento: {formatNumber(astralMap.birth_hour)}:{formatNumber(astralMap.birth_minute)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: SPACING.SMALL,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.MEDIUM,
  },
  titleContainer: {
    flex: 1,
    marginLeft: SPACING.MEDIUM,
  },
  infoCardTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.TINY,
  },
  infoCardName: {
    color: COLORS.HIGHLIGHT,
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  infoCardBirthData: {
    alignSelf: 'flex-end',
    marginTop: SPACING.MEDIUM,
  },
  infoCardDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
    lineHeight: 22,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'left',
  },
  infoCardData: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
    lineHeight: 22,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  expandButton: {
    padding: SPACING.SMALL,
  },
  expandedInfo: {
    marginTop: SPACING.LARGE,
    paddingTop: SPACING.LARGE,
    borderTopWidth: 1,
    borderTopColor: 'rgba(109, 68, 255, 0.2)',
  },
});

export default InfoCard;
