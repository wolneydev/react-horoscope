import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import citiesBr from '../data/geo/citiesBr';

// Importa o objeto com todas as cidades
// Ajuste o caminho para o arquivo citiesBr.js

const CityAutoComplete = () => {
  // Armazena o texto digitado
  const [searchText, setSearchText] = useState('');
  // Armazena a lista de sugestões filtradas
  const [filteredCities, setFilteredCities] = useState([]);
  // Armazena os dados da cidade selecionada
  const [citySelected, setCitySelected] = useState(null);

  // Função para filtrar as cidades de acordo com o texto digitado
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 0) {
      // Filtra a lista de cidades
      const filtered = citiesBr.cities.filter((item) =>
        item.city.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 10)); // Exemplo: limita a 10 resultados
    } else {
      setFilteredCities([]);
    }
  };

  // Função chamada quando usuário seleciona uma cidade
  const handleSelectCity = (item) => {
    // Atualiza o estado com todos os dados da cidade selecionada, incluindo latitude/longitude
    setCitySelected({
      city: item.city,
      state: item.state,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
    });

    // Atualiza o texto do campo de pesquisa para exibir apenas algo como "Cidade - Estado - País"
    setSearchText(`${item.city}, ${item.state}, ${item.country}`);

    // Limpa as sugestões
    setFilteredCities([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Digite o nome de uma cidade:</Text>
      
      <TextInput
        style={styles.input}
        value={searchText}
        onChangeText={handleSearch}
        placeholder="Ex: Rio de Janeiro"
      />

      {/* Lista de sugestões */}
      {filteredCities.length > 0 && (
        <FlatList
          data={filteredCities}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelectCity(item)}
            >
              <Text>{`${item.city} - ${item.state} - ${item.country}`}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Exemplo de exibição dos dados completos da cidade selecionada */}
      {citySelected && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>Cidade Selecionada:</Text>
          <Text>Cidade: {citySelected.city}</Text>
          <Text>Estado: {citySelected.state}</Text>
          <Text>País: {citySelected.country}</Text>
          <Text>Latitude: {citySelected.latitude}</Text>
          <Text>Longitude: {citySelected.longitude}</Text>
        </View>
      )}
    </View>
  );
};

export default CityAutoComplete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  suggestionItem: {
    padding: 8,
    backgroundColor: '#eee',
    marginBottom: 2,
  },
  selectedContainer: {
    marginTop: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  selectedTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
