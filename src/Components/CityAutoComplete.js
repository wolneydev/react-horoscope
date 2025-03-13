// src/Components/CityAutoComplete.js
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Text, 
  StyleSheet, 
  Keyboard,
  Dimensions
} from 'react-native';
import { Portal } from '@gorhom/portal';
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
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Medir a posição do input para posicionar corretamente a lista de sugestões
    if (filteredCities.length > 0 && containerRef.current) {
      containerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setPosition({
          top: pageY + height,
          left: pageX,
          width: width
        });
      });
    }
  }, [filteredCities]);

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

  const handleSelectCity = useCallback((item) => {
    // Chama a callback do pai
    if (onCitySelected) {
      onCitySelected(item);
    }
    // Ajusta o texto do campo
    setSearchText(`${item.city}, ${item.state}, ${item.country}`);
    // Limpa as sugestões
    setFilteredCities([]);
    // Fecha o teclado
    Keyboard.dismiss();
  }, [onCitySelected]);

  // Renderiza o item da lista separadamente para melhorar o desempenho
  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectCity(item)}
    >
      <Text style={styles.suggestionText}>
        {`${item.city} - ${item.state} - ${item.country}`}
      </Text>
    </TouchableOpacity>
  ), [handleSelectCity]);

  return (
    <>
      <View 
        ref={containerRef}
        style={styles.container}
        collapsable={false}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, style]}
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Cidade de nascimento"
          placeholderTextColor={placeholderTextColor}
        />
      </View>
      
      {filteredCities.length > 0 && (
        <Portal>
          <View 
            style={[
              styles.suggestionsContainer,
              {
                top: position.top,
                left: position.left,
                width: position.width
              }
            ]}
          >
            <FlatList
              data={filteredCities}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
            />
          </View>
        </Portal>
      )}
    </>
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
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 9999,
    elevation: 5, // Para Android
    shadowColor: '#000', // Para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  list: {
    maxHeight: 200,
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
