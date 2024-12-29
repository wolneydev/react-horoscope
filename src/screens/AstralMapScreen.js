// src/screens/AstralMapScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground } from 'react-native';

export default function AstralMapScreen({ route }) {
  const { astralMap } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.astroName}>{item.astro.name}</Text>
      <Text style={styles.horoscopeName}>{item.sign.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.astroName}>Barra de açoes</Text>
      <View style={styles.divider} />
      <ImageBackground source={require('../assets/images/starry-night2.jpg')} style={styles.bigCard}>
        <ImageBackground source={require('../assets/images/starry-night2.jpg')} style={styles.card}>
          <Text style={styles.astroName}>Pronto!</Text>
          <Text style={styles.horoscopeName}>testando</Text>
          <Text style={styles.description}>layout</Text>
          </ImageBackground>

        <View style={styles.divider} />

        <FlatList
          data={astralMap.astros}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
        
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B29', // Fundo escuro que remete ao céu noturno
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9F8F8', // Tom claro para contraste
    marginBottom: 12,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: '#FFD700',
    marginTop: 8,
    marginBottom: 24,

  },
  bigCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#000', // Tom intermediário, simulando um “tom de constelação”
    borderColor: '#FFD700',      // Borda dourada para destacar o card
    borderRadius: 8,
    shadowColor: '#000',        // Leve sombra para destacar o card
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#1E1B29', // Tom intermediário, simulando um “tom de constelação”
    borderRadius: 8,
    shadowColor: '#000',        // Leve sombra para destacar o card
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  astroName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700', // Dourado para destacar o “astro”
    marginBottom: 2,
  },
  horoscopeName: {
    fontSize: 16,
    color: '#C9BBCF', // Tom suave que combine com o fundo
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#fff', // Tom mais claro para fácil leitura
    lineHeight: 20,
  },
});
