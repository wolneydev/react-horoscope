// App.js
import React from 'react';
import "react-native-url-polyfill/auto";
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
// Importando as telas
import SplashScreen from './src/screens/SplashScreen';
import AstralMapScreen from './src/screens/AstralMapScreen';
import IndexScreen from './src/screens/IndexScreen';
import HomeScreen from './src/screens/HomeScreen';
import HousesScreen from './src/screens/HousesScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CompatibilityScreen from './src/screens/CompatibilityScreen';
import GreetingsScreen from './src/screens/GreetingsScreen';
import { enableScreens } from 'react-native-screens';
import LoadingOverlay from './src/Components/LoadingOverlay';
import StorageService from './src/store/store';
import { useState, useRef, useEffect } from 'react';


enableScreens(false);

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Stack Navigator para telas principais
function MainStack() {
  return (
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={IndexScreen}
        name="IndexScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={HousesScreen}
        name="HousesScreen"
        options={{ headerShown: false }}
      />      
    
      <Stack.Screen
        name="AstralMapScreen"
        component={AstralMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GreetingsScreen"
        component={GreetingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={AppDrawer}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props) {
  const [userData, setUserData] = useState(null);
  const [zodiacSign, setZodiacSign] = useState("default");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedUserData = await StorageService.getUserData();

        if (savedUserData?.birthData?.day && savedUserData?.birthData?.month) {
          const sign = getZodiacSign(savedUserData.birthData.day, savedUserData.birthData.month);
          setZodiacSign(sign);
        }

        setUserData(savedUserData);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  // Função para identificar o signo
  const getZodiacSign = (day, month) => {
    const zodiacSigns = [
      { sign: "capricorn", start: "12-22", end: "01-19" },
      { sign: "aquarius", start: "01-20", end: "02-18" },
      { sign: "pisces", start: "02-19", end: "03-20" },
      { sign: "aries", start: "03-21", end: "04-19" },
      { sign: "taurus", start: "04-20", end: "05-20" },
      { sign: "gemini", start: "05-21", end: "06-20" },
      { sign: "cancer", start: "06-21", end: "07-22" },
      { sign: "leo", start: "07-23", end: "08-22" },
      { sign: "virgo", start: "08-23", end: "09-22" },
      { sign: "libra", start: "09-23", end: "10-22" },
      { sign: "scorpio", start: "10-23", end: "11-21" },
      { sign: "sagittarius", start: "11-22", end: "12-21" },
    ];

    const birthDate = `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    console.log("Data de nascimento:", birthDate);

    for (const zodiac of zodiacSigns) {
      if (
        (birthDate >= zodiac.start && month === parseInt(zodiac.start.split("-")[0])) ||
        (birthDate <= zodiac.end && month === parseInt(zodiac.end.split("-")[0]))
      ) {
        console.log("Signo encontrado:", zodiac.sign);
        return zodiac.sign;
      }
    }

    return "default";
  };

  // Objeto de mapeamento de imagens
  const zodiacImages = {
    aries: require("./src/assets/images/sign/aries.jpg"),
    taurus: require("./src/assets/images/sign/taurus.jpg"),
    gemini: require("./src/assets/images/sign/gemini.jpg"),
    cancer: require("./src/assets/images/sign/cancer.jpg"),
    leo: require("./src/assets/images/sign/leo.jpg"),
    virgo: require("./src/assets/images/sign/virgo.jpg"),
    libra: require("./src/assets/images/sign/libra.jpg"),
    scorpio: require("./src/assets/images/sign/scorpio.jpg"),
    sagittarius: require("./src/assets/images/sign/sagittarius.jpg"),
    capricorn: require("./src/assets/images/sign/capricorn.jpg"),
    aquarius: require("./src/assets/images/sign/aquarius.jpg"),
    pisces: require("./src/assets/images/sign/pisces.jpg"),
    default: require("./src/assets/images/sign/virgo.jpg"), // Imagem fallback
  };

  console.log("Imagem carregada:", zodiacImages[zodiacSign]); // Debug

  return (
    <DrawerContentScrollView {...props}>
      {/* Header com Avatar */}
      <View style={styles.drawerHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image 
              source={zodiacImages[zodiacSign]} // Usa a imagem correspondente ao signo
              style={styles.avatar}
            />
            <View style={styles.statusDot} />
          </View>
          <View style={styles.userTextInfo}>
            <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
            <Text style={styles.userName}>{userData?.name || "Usuário"}</Text>
          </View>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

// Menu Drawer Navigator
function AppDrawer() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      // Mostra o loading imediatamente
      setIsLoading(true);

      // Simula um pequeno delay para mostrar o loading (opcional)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Limpa os dados do usuário
      await StorageService.clearAll();

      // Navega para a tela de login
      navigation.reset({
        index: 0,
        routes: [{ name: 'IndexScreen' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { 
            backgroundColor: '#141527',
            borderWidth: 1,
            borderColor: 'rgba(109, 68, 255, 0.2)'
          },          
          headerTintColor: 'white',
          drawerStyle: { 
            backgroundColor: '#141527',
            borderRightWidth: 1,
            borderRightColor: 'rgba(109, 68, 255, 0.2)',
          },
          drawerActiveTintColor: 'white',
          drawerActiveBackgroundColor: 'rgba(109, 68, 255, 0.2)',
          drawerInactiveTintColor: '#fff',
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}
        />
        
        <Drawer.Screen
          name="Mapa Astral"
          component={AstralMapScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="agriculture" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="Sinastria"
          component={CompatibilityScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="stars" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen
          name="Casas"
          component={HousesScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="stars" color={color} size={size} />
            ),
          }}
        />        
        <Drawer.Screen
          name="Sair"
          component={EmptyComponent}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="logout" color={color} size={size} />
            ),
          }}
          listeners={{
            drawerItemPress: (e) => {
              e.preventDefault();
              handleLogout();
            },
          }}
        />
      </Drawer.Navigator>

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
    </>
  );
}

// Componente vazio para o item "Sair"
const EmptyComponent = () => null;

// Componente principal
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content:{
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingLeft: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(109, 68, 255, 0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#6D44FF',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#141527',
  },
  userTextInfo: {
    marginLeft: 15,
  },
  welcomeText: {
    color: '#7A708E',
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default App;
