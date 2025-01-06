import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ImageBackground, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GreetingsScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('GreetingsFirstDataScreen');
    }, 5000);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/images/starry-night2.jpg')} style={styles.section}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>É aqui que começa sua jornada</Text>
          <Text style={styles.sectionDescription}>
            Vamos procurar seu par ideal com base no seu mapa astral!
          </Text>
        </View>
        <View style={styles.section30}>
          <Text style={styles.sectionText}>Colocar um gif animado qualquer aqui. uma constelaçãozinha gitando uma mandala qq zorra</Text>
          <Text style={styles.sectionText}>Vamos te conhecer melhor!</Text>
          <Button title="Começar" onPress={() => navigation.navigate('GreetingsFirstDataScreen')} />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 20,
  },
  section30: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
  sectionText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#fff',
  },
});

export default GreetingsScreen;