import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';

const InfoCard = ({ 
  title, 
  description, 
  icon = "info", 
  isInfoExpanded = false, 
  setIsInfoExpanded = null,
  expandable = true,
  iconColor = COLORS.PRIMARY
}) => {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardHeader}>
        <View style={styles.infoIconContainer}>
          <Icon name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.infoCardTitle}>{title}</Text>
        </View>
        {expandable && setIsInfoExpanded && (
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
        )}
      </View>

      {(!expandable || isInfoExpanded) && description && (
        <View style={expandable ? styles.expandedInfo : styles.description}>
          <Text style={styles.infoCardDescription}>
            {description}
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
    marginBottom: SPACING.TINY,
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
  infoCardDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
    lineHeight: 22,
    marginBottom: SPACING.TINY,
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
  description: {
    marginTop: SPACING.MEDIUM,
  }
});

export default InfoCard; 