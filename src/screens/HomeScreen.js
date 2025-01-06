import React from 'react';
import { View, StyleSheet, Text, ImageBackground, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>

      <ImageBackground source={require('../assets/heart-constellation.png')} style={styles.section}>
      </ImageBackground>
      <ImageBackground source={require('../assets/images/starry-night2.jpg')} style={styles.section}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Astral Match</Text>
          <Text style={styles.sectionDescription}>
            Encontre seu par ideal com base no seu mapa astral!
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button title="Começar uma nova jornada astral" onPress={() => navigation.navigate('GreetingsScreen')} />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="Já tenho uma conta" onPress={() => {}} />
            </View>
          </View>
          <Text style={styles.sectionText}>Ao continuar, você concorda com os Termos de Serviço e a Política de Privacidade.</Text>
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
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonWrapper: {
    marginVertical: 5,
  },
});

export default HomeScreen;