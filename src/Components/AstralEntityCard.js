import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const AstralEntityCard = ({ item, imageMap }) => {
  return (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          <Image
            source={imageMap[item.sign.name.toLowerCase()]}
            style={styles.image}
          />
        </View>
        <View style={styles.headerTexts}>
          <Text style={styles.astroName}>{item.astral_entity.name}</Text>
          <Text style={styles.horoscopeName}>
            {item.sign.name} - {item.degree}º
          </Text>
        </View>
      </View>
      {item.astral_entity.explanation && (
        <Text style={styles.explanation}>{item.astral_entity.explanation}</Text>
      )}
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 10,
  },
  astroName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 2,
  },
  horoscopeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'lightblue',
  },
  explanation: {
    fontSize: 12,
    color: 'lightblue',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
});

export default AstralEntityCard;
