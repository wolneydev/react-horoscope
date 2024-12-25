// src/screens/AstralMapScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function AstralMapScreen({ route }) {
  // Pegamos a lista passada como parâmetro
  const { astralMap } = route.params; 
  // astralMap é o "json.data.data" retornado na requisição

  // Render de cada item da lista
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.astroName}>{item.astro_name}</Text>
      <Text style={styles.horoscopeName}>{item.horoscope_name}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seu Mapa Astral</Text>
      <FlatList
        data={astralMap}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12
  },
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F1F1F1',
    borderRadius: 6
  },
  astroName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  horoscopeName: {
    fontSize: 16,
    marginVertical: 4
  },
  description: {
    fontSize: 14,
    color: '#666'
  }
});
