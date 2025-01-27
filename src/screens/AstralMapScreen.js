import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, BackHandler, ToastAndroid, TouchableOpacity, Button } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Certifique-se de que este pacote está instalado
import StorageService from '../store/store';
import Header from '../Components/Header';
import AnimatedStars from '../Components/animation/AnimatedStars';

export default function AstralMapScreen() {
  const navigation = useNavigation();
  const [astralMap, setAstralMap] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize AnimatedStars para evitar re-renderização
  const memoizedStars = useMemo(() => <AnimatedStars />, []);

  const CustomButton = ({ title, onPress, color, disabled }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.buttonWrapper,
        color === '#ff4444' && { 
          backgroundColor: 'rgba(109, 68, 255, 0.15)', 
          borderColor: 'white' 
        },
        disabled && { opacity: 0.5 }
      ]}
    >
      <View style={styles.buttonContent}>
        <Text style={[
          styles.buttonText,
          color === '#ff4444' && { 
            color: 'white',
            textShadowColor: '#ff4444'
          }
        ]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Previne o usuário de voltar para a tela de cadastro ou login uma vez logado
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        navigation.navigate('HomeScreen');
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  // Carrega o mapa astral do storage
  useEffect(() => {
    const loadAstralMap = async () => {
      try {
        const savedAstralMap = await StorageService.getAstralMap();
        setAstralMap(savedAstralMap);
      } catch (error) {
        console.error('Erro ao carregar mapa astral:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAstralMap();
  }, []);

  const copyUuidToClipboard = useCallback(() => {
    try {
      if (astralMap?.uuid) {
        Clipboard.setString(astralMap.uuid);
        ToastAndroid.show('Código copiado com sucesso!', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Código não disponível', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      ToastAndroid.show('Erro ao copiar código', ToastAndroid.SHORT);
    }
  }, [astralMap?.uuid]);

  // Função para renderizar cada item de 'astral_entities'
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Nome do astro (por exemplo: 'Sol', 'Lua', 'Ascendente', etc.) */}
      <Text style={styles.astroName}>{item.astral_entity.name}</Text>

      {/* explanation (caso exista) */}
      {item.astral_entity.explanation && (
        <Text style={styles.explanation}>{item.astral_entity.explanation}</Text>
      )}
      {/* Signo em que esse astro se encontra (por exemplo: 'Leão', 'Câncer', etc.) */}
      <Text style={styles.horoscopeName}>{item.sign.name} - {item.degree}º</Text>

      {/* Descrição do posicionamento */}
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {memoizedStars}
        <Header />
        <View style={[styles.content, styles.centerContent]}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </View>
    );
  }

  if (!astralMap) {
    return (
      <View style={styles.container}>
        {memoizedStars}
        <Header />
        <View style={[styles.content, styles.centerContent]}>
          <Text style={styles.errorText}>Não foi possível carregar o mapa astral</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {memoizedStars}
      <Header />
      <View style={styles.content}>

        <View style={styles.explanationContainer}>
          <Text style={styles.codeText}>
            Este é o código de seu mapa! Compartilhe com alguém que deseja verificar a compatibilidade entre seus mapas. Aperte para copiar.
          </Text>
          <CustomButton 
            title={astralMap.uuid} 
            onPress={() => copyUuidToClipboard()}
            disabled={loading}
          />
        </View>

        <FlatList
          data={astralMap.astral_entities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={styles.flatList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B29',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
    marginTop: 16,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'white',
  },
  copyButton: {
    marginLeft: 10,
    padding: 5,
  },
  astroName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700', // Dourado para destacar o "astro"
    marginBottom: 2,
  },
  horoscopeName: {
    fontSize: 16,
    fontWeight: 'bold',
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
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  explanationContainer: {
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  codeText: {
    marginTop: 10,
    marginBottom: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'justify',
  },
  buttonWrapper: {
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(109, 68, 255, 0.15)', 
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
