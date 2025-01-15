import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ImageBackground, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../store/store';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUserData = await StorageService.getUserData();
        console.log('savedUserData', savedUserData);
        setUserData(savedUserData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await StorageService.clearAll();
      setUserData(null);
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/heart-constellation.png')} style={styles.section}>
        {userData && (
          <Text style={styles.welcomeText}>Bem-vindo(a), {userData.name}!</Text>
        )}
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
            {!userData ? (
              <>
                <View style={styles.buttonWrapper}>
                  <Button 
                    title="Começar uma nova jornada astral" 
                    onPress={() => navigation.navigate('GreetingsScreen')} 
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button 
                    title="Já tenho uma conta" 
                    onPress={() => navigation.navigate('LoginScreen')} 
                  />
                </View>
              </>
            ) : (
              <View>
                <Text style={styles.welcomeText}>Bem-vindo(a), {userData.name}!</Text>
                <View style={styles.buttonWrapper}>
                  <Button 
                    style={styles.buttonStyle}
                    title="Ver meu mapa astral" 
                    onPress={() => navigation.navigate('AstralMapScreen')} 
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button 
                    title="Sair" 
                    onPress={handleLogout}
                    color="#ff4444" // cor vermelha para o botão de logout
                  />
                </View>

              </View>
            )}
          </View>
          <Text style={styles.sectionText}>
            Ao continuar, você concorda com os Termos de Serviço e a Política de Privacidade.
          </Text>
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
  welcomeText: {
    fontSize: 20,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonStyle: {
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  },
});

export default HomeScreen;