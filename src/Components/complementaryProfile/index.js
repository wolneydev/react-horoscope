import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../../services/api';


import MultipleBadge from '../multipleBadge';
import Dropdown from '../dropdown';

const ComplementaryProfile = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [music, movies, beverages, smoking, religions, education, politics] = await Promise.all([
          api.get('musicpreferences'),
          api.get('movieseriegenres'),
          api.get('alcoholicbeverages'),
          api.get('smokingpreferences'),
          api.get('religions'),
          api.get('educationlevels'),
          api.get('politicalpositions'),
        ]);
        
        setSections([
          { label: 'Gostos Musicais', data: music.data.data.items, component: MultipleBadge }, 
          { label: 'Filmes e Séries', data: movies.data.data.items, component: MultipleBadge },
          { label: 'Gosta de beber?', data: beverages.data.data.items, component: MultipleBadge },
          { label: 'Cigarro', data: smoking.data.data.items, component: Dropdown },
          { label: 'Tem alguma religião?', data: religions.data.data.items, component: Dropdown },
          { label: 'Qual sua formação?', data: education.data.data.items, component: Dropdown },
          { label: 'Posicionamento político', data: politics.data.data.items, component: Dropdown },
        ]);
      } catch (error) {
        console.error('Erro ', error);
      }
    }

    loadAllData();
  }, []);

  const renderSection = ({ item }) => (
    <View style={styles.section}>
      <Text style={styles.sectionMainTitle}>{item.label}</Text>
      {item.component === Dropdown ? (
        <Dropdown data={item.data} />
      ) : (
        <MultipleBadge data={item.data} />
      )}
    </View>
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>Cadastro de perfil</Text>
      <FlatList
        data={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderSection}
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionMainTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
});

export default ComplementaryProfile;
