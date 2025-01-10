// src/screens/AstralMapScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground } from 'react-native';

export default function AstralMapScreen({ route }) {
  // A partir de route.params, extraímos o objeto astralMap
  const { astralMap } = route.params;

  // Função para renderizar cada item de 'astral_entities'
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Nome do astro (por exemplo: 'Sol', 'Lua', 'Ascendente', etc.) */}
      <Text style={styles.astroName}>{item.astral_entity.name}</Text>
      {/* Signo em que esse astro se encontra (por exemplo: 'Leão', 'Câncer', etc.) */}
      <Text style={styles.horoscopeName}>{item.sign.name}  -  {item.degree}º</Text>
      {/* explanation (caso exista) */}
      {item.astral_entity.explanation && (
        <Text style={styles.explanation}>{item.astral_entity.explanation}</Text>
      )}

      {/* Descrição do posicionamento */}
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.divider} />

      <ImageBackground
        source={require('../assets/images/starry-night2.jpg')}
        style={styles.bigCard}
      >
        <View style={styles.divider} />

        {/* FlatList para exibir as entidades astrais (planetas, Asc/Desc, etc.) */}
        <FlatList
          data={astralMap.astral_entities}
          keyExtractor={(item) => item.id.toString()}
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
    backgroundColor: '#000',  // Tom intermediário, simulando um “tom de constelação”
    borderColor: '#FFD700',   // Borda dourada para destacar o card
    borderRadius: 8,
    shadowColor: '#000',      
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#1E1B29', 
    borderRadius: 8,
    shadowColor: '#000',        
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
    fontSize: 14,
    color: 'lightblue', // Tom suave que combine com o fundo
    marginBottom: 4,
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
