import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';

const InfoCardSinastria = ({ isInitialized, extraMapsUsed, maxExtraMaps, isInfoExpanded, setIsInfoExpanded }) => {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardHeader}>
        <View style={styles.infoIconContainer}>
          <Icon name="favorite" size={24} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.infoCardTitle}>Sinastria Astrológica</Text>
          {isInitialized && (
            <Text style={styles.extraMapsText}>
              Mapas Extras: {extraMapsUsed}/{maxExtraMaps}
            </Text>
          )}
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
            A sinastria é a arte de comparar dois mapas astrais para entender a 
            dinâmica do relacionamento. Ela revela as harmonias, desafios e o 
            potencial de crescimento entre duas pessoas.
          </Text>
          <Text style={styles.infoCardDescription}>
            Adicione novos mapas e verifique, através da sinastria, a compatibilidade deles com o seu mapa.
          </Text>
          <Text style={styles.infoCardDescription}>
            Inicialmente você possui 1 mapa extra disponível. Adquira mais mapas para continuar gerando comparações.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
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
  extraMapsText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
  },
  infoCardDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
    lineHeight: 22,
    marginBottom: SPACING.LARGE,
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

export default InfoCardSinastria;
