import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const CompatibilityItem = ({
  item,
  astros,
  getCompatibilityColor,
  getAstroImage,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardImageContainer}>
          <Image
            source={getAstroImage(item.astral_entity, astros)}
            style={styles.astroImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.entity}>
            {item.astral_entity || 'Entidade não definida'}
          </Text>
          <View style={styles.signsContainer}>
            <Text style={styles.signs}>
              {item.signo1} × {item.signo2} |
            </Text>
            <Text
              style={[
                styles.compatibilityValue,
                {
                  color: getCompatibilityColor(item.compatibilidade),
                  textShadowColor: `${getCompatibilityColor(item.compatibilidade)}50`,
                },
              ]}
            >
              {item.compatibilidade}%
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.description}>{item.descriptions}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 10,
  },
  astroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    marginRight: 10,
  },
  cardHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  entity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  signsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signs: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  compatibilityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default CompatibilityItem;
