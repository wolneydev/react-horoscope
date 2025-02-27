// src/Components/CityAutoComplete.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet } from 'react-native';
import citiesBr from '../data/geo/citiesBr';

/**
 * Componente de autocomplete para buscar cidades brasileiras.
 * 
 * @param {function} onCitySelected - Callback para enviar o objeto da cidade selecionada ao componente pai.
 * @param {string} placeholderTextColor - Cor do placeholder (opcional).
 * @param {object} style - Estilo adicional aplicado ao TextInput (opcional).
 */
const CityAutoComplete = ({
  onCitySelected,
  placeholderTextColor = '#999',
  style,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = citiesBr.cities.filter((item) =>
        item.city.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 10));
    } else {
      setFilteredCities([]);
    }
  };

  const handleSelectCity = (item) => {
    // Chama a callback do pai
    if (onCitySelected) {
      onCitySelected(item);
    }
    // Ajusta o texto do campo
    setSearchText(`${item.city}, ${item.state}, ${item.country}`);
    // Limpa as sugestões
    setFilteredCities([]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, style]}
        value={searchText}
        onChangeText={handleSearch}
        placeholder="Cidade de nascimento"
        placeholderTextColor={placeholderTextColor}
      />
      {filteredCities.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredCities}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectCity(item)}
              >
                <Text style={styles.suggestionText}>
                  {`${item.city} - ${item.state} - ${item.country}`}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default CityAutoComplete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50, // Ajuste conforme necessário para não sobrepor o TextInput
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e',
    zIndex: 999,
    borderRadius: 8,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  suggestionText: {
    color: '#FFFFFF',
  },
});
