import React, { useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";

const MultipleBadge = ({ data }) => {
  const [selectedBadges, setSelectedBadges] = useState([]); // Estado para rastrear badges selecionados

  const handleBadgePress = (name) => {
    if (selectedBadges.includes(name)) {
      // Se o badge já estiver selecionado, remove da lista
      setSelectedBadges(selectedBadges.filter(badge => badge !== name));
    } else {
      // Se não estiver selecionado, adiciona à lista
      setSelectedBadges([...selectedBadges, name]);
    }
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.name} // Usando 'name' como chave única
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.badge, selectedBadges.includes(item.name) && styles.badgePressed]}
          onPress={() => handleBadgePress(item.name)} // Chama a função ao pressionar
        >
          <Text style={[styles.badgeText, selectedBadges.includes(item.name) && styles.badgeTextPressed]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
      numColumns={3} // Número de colunas
      contentContainerStyle={styles.badgeContainer}
    />
  );
};

const styles = StyleSheet.create({
  badge: {

    backgroundColor: 'gray', // Fundo #F0FFF0
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginVertical: 4,
    marginRight: 8, // Espaçamento entre badges
    alignSelf: 'flex-start', // Ajusta para conteúdo flexível
    borderWidth: 1,
    borderColor: 'black', // Bordas navy claras
  },
  badgePressed: {
    backgroundColor: '#42b883', // Fundo 7B68EE ao clicar
  },
  badgeText: {
    color: 'black', // Texto preto
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeTextPressed: {
    color: 'black', // Texto gray  ao clicar
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Centraliza as badges
  },
});

export default MultipleBadge;
