import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';

const ScreenMenuItemCard = ({ 
  title, 
  description, 
  icon = 'arrow-forward', 
  onPress, 
  disabled = false,
  style
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        disabled && styles.disabledCard,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Icon name={icon} size={24} color={COLORS.PRIMARY} style={styles.cardIcon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    ...CARD_STYLES.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.TINY,
  },
  cardDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
  },
  cardIcon: {
    marginLeft: SPACING.MEDIUM,
  },
  disabledCard: {
    opacity: 0.5,
  },
});

export default ScreenMenuItemCard;
