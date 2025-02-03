import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import StorageService from '../store/store';

const SynastryScreen = () => {
  const navigation = useNavigation();
  const [extraCharts, setExtraCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExtraCharts();
  }, []);

  const loadExtraCharts = async () => {
    try {
      setIsLoading(true);
      const charts = await StorageService.getExtraCharts();
      setExtraCharts(charts);
    } catch (error) {
      console.error('Erro ao carregar mapas extras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChartItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chartCard}
      onPress={() => {
        // Adicionar navegação para comparação de mapas
        navigation.navigate('HomeScreen', { 
          screen: 'Mapa Astral', 
          params: { astralMap: item } 
        });
      }}
    >
      <View style={styles.chartIconContainer}>
        <Icon name="person" size={24} color="#6D44FF" />
      </View>
      <View style={styles.chartInfo}>
        <Text style={styles.chartName}>{item.astral_map_name}</Text>
        <Text style={styles.chartDetails}>
          {item.birthDate} às {item.birthTime}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color="#6D44FF" />
    </TouchableOpacity>
  );

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  return (
    <View style={styles.container}>
      {memoStars}
      
      {/* Card Explicativo */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Icon name="favorite" size={24} color="#6D44FF" />
        </View>
        <Text style={styles.infoCardTitle}>Sinastria Astrológica</Text>
        <Text style={styles.infoCardDescription}>
          A sinastria é a arte de comparar dois mapas astrais para entender a 
          dinâmica do relacionamento. Ela revela as harmonias, desafios e o 
          potencial de crescimento entre duas pessoas.
        </Text>
      </View>

      {/* Botão para Adicionar */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateExtraChartScreen')}
      >
        <Icon name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Criar Novo Mapa Astral</Text>
      </TouchableOpacity>

      {/* Lista de Mapas */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Mapas Astrais Salvos</Text>
        {isLoading ? (
          <ActivityIndicator color="#6D44FF" size="large" />
        ) : (
          <FlatList
            data={extraCharts}
            renderItem={renderChartItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.chartsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum mapa astral adicional encontrado
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.15)',
  },
  infoIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoCardDescription: {
    color: '#bbb',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(109, 68, 255, 0.3)',
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.6)',
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  chartIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    marginRight: 15,
  },
  chartInfo: {
    flex: 1,
  },
  chartName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartDetails: {
    color: '#bbb',
    fontSize: 14,
    marginTop: 2,
  },
  chartsList: {
    marginTop: 10,
  },
  emptyText: {
    color: '#7A708E',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default SynastryScreen;
