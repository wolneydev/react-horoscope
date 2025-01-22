import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import api from '../services/api';

export default function CompatibilityScreen({ route }) {
  const [uuid1] = useState(route.params?.uuid1 || ''); // Recebe o uuid1 da tela anterior
  const [uuid2, setUuid2] = useState('');
  const [compatibilities, setCompatibilities] = useState([]);
  const [averageCompatibility, setAverageCompatibility] = useState(null); // Estado para armazenar a compatibilidade média
  const [loading, setLoading] = useState(false);

  // Função que busca as compatibilidades entre os dois UUIDs
  const fetchCompatibility = async () => {
    if (!uuid1 || !uuid2) {
      alert('Por favor, insira o código correto');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('processcompatibilitiesmap', {
        params: { uuid1, uuid2 }, // Enviando uuid1 e uuid2 na requisição
      });

      const { compatibilidades, compatibilidade_media } = response.data.data;
      setCompatibilities(compatibilidades || []);
      setAverageCompatibility(compatibilidade_media || null); // Armazena a compatibilidade média
    } catch (error) {
      console.error('Erro ao buscar compatibilidades:', error);
      alert('Erro ao buscar compatibilidades. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.entity}>
        {item.astral_entity || 'Entidade não definida'}
      </Text>
      <Text style={styles.details}>
        {item.signo1} x {item.signo2} - {item.compatibilidade}%
      </Text>
      <Text style={styles.details}>
        Descrição: {item.descriptions} 
      </Text>      
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.averageTitle}>Compatibilidade Média</Text>
      <Text style={styles.averageValue}>
        {averageCompatibility !== null
          ? `${averageCompatibility.toFixed(2)}%`
          : 'Não calculada'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Sinastria</Text>

          {/* Campo do UUID2 - Aqui o usuário digita o segundo UUID */}
          <Text style={styles.label}>Cole ou digite o código do mapa da pessoa que deseja comparar</Text>
          <TextInput
            style={styles.input}
            placeholder="Insira o código aqui"
            placeholderTextColor="#aaa"
            value={uuid2}
            onChangeText={setUuid2}
            keyboardType="default" // Se necessário, adicione um tipo específico de teclado
          />

          {/* Botão para buscar compatibilidade */}
          <Button title="Ver Compatibilidade Astral" onPress={fetchCompatibility} />

          {/* Loader de carregamento */}
          {loading && <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />}

          {/* Lista de compatibilidades */}
          <FlatList
            data={compatibilities}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            style={styles.list}
            ListFooterComponent={renderFooter} // Adiciona o componente de rodapé
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1E1B29',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'lightblue',
    marginBottom: 16,
    textAlign: 'center',
  },  
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 16,
  },
  list: {
    marginTop: 16,
  },
  card: {
    backgroundColor: '#2E2B3A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  entity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  details: {
    fontSize: 14,
    color: '#FFF',
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2E2B3A',
    borderRadius: 8,
    alignItems: 'center',
  },
  averageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  averageValue: {
    fontSize: 16,
    color: '#FFF',
  },
});
