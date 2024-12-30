import React from 'react';
import { View, StyleSheet, Text, ImageBackground, Button } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>

      <ImageBackground source={require('../assets/heart-constellation.png')} style={styles.section}>
      </ImageBackground>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Astral Match</Text>
        <Text style={styles.sectionDescription}>
          Encontre seu par ideal com base no seu mapa astral!
        </Text>
      </View>
      <View style={styles.section}>
        <View style={styles.buttonContainer}>
          <Button title="Button 1" onPress={() => {}} />
          <Button title="Button 2" onPress={() => {}} />
        </View>
        <Text style={styles.sectionText}>Some additional information below the buttons.</Text>
      </View>
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
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
});

export default HomeScreen;