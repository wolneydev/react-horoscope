// App.js
import React from 'react';
import "react-native-url-polyfill/auto";
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Alert,
} from 'react-native';
// Importando as telas
import SplashScreen from './src/screens/SplashScreen';
import AstralMapScreen from './src/screens/AstralMapScreen';
import IndexScreen from './src/screens/IndexScreen';
import HomeScreen from './src/screens/HomeScreen';
import HousesScreen from './src/screens/HousesScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SynastryDesambiguationScreen from './src/screens/SynastryDesambiguationScreen';
import GreetingsScreen from './src/screens/GreetingsScreen';
import CompatibilityScreen from './src/screens/CompatibilityScreen';
import CreateExtraChartScreen from './src/screens/CreateExtraChartScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import MyAccountScreen from './src/screens/MyAccountScreen';
import { enableScreens } from 'react-native-screens';
import LoadingOverlay from './src/Components/LoadingOverlay';
import StorageService from './src/store/store';
import { useState, useRef, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import MyPurchasesScreen from './src/screens/MyPurchasesScreen';
import { PrivacyPolicyScreen, TermsOfUseScreen } from './src/screens/TermsScreen';
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
        {/* Tela de Termos de Uso */}
        <Stack.Screen
          name="TermsOfUseScreen"
          component={TermsOfUseScreen}
          options={{
            title: 'Termos de Uso',
            headerStyle: { backgroundColor: '#141527' },
            headerTintColor: '#fff',
          }}
        />

        {/* Tela de Política de Privacidade */}
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
          options={{
            title: 'Política de Privacidade',
            headerStyle: { backgroundColor: '#141527' },
            headerTintColor: '#fff',
          }}
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
      <Drawer.Screen
          name="CompatibilityScreen"
        
          component={CompatibilityScreen}
          options={{
            headerShown: false,
            drawerLabel: 'Compatibilidade Astral',
            drawerIcon: ({ color, size }) => (
              <Icon name="arrow" color={color} size={size} />
            ),
          }}
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
        name="CreateExtraChartScreen"
        component={CreateExtraChartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={AppDrawer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SynastryDesambiguationScreen"
        component={SynastryDesambiguationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyAccountScreen"
        component={MyAccountScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Criar um Stack Navigator para as telas de Sinastria
function SinastriaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="SynastryDesambiguation" 
        component={SynastryDesambiguationScreen} 
      />
      <Stack.Screen 
        name="CreateExtraChart" 
        component={CreateExtraChartScreen} 
      />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props) {
  const [userData, setUserData] = useState(null);
  const [zodiacSign, setZodiacSign] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const currentRoute = props.state.routeNames[props.state.index];

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

  const handleLogout = async () => {
    try {
      // Mostra o loading imediatamente
      setIsLoading(true);

      // Simula um pequeno delay para mostrar o loading (opcional)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Limpa os dados do usuário
      await StorageService.clearAll();

      // Navega para a tela de login
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'IndexScreen' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExtraChart = () => {
    // Verifica se já existe um mapa astral principal
    StorageService.getMainAstralMap()
      .then(mainMap => {
        if (mainMap) {
          // Se existe mapa principal, navega direto para criar mapa extra
          props.navigation.navigate('CreateExtraChart');
        } else {
          // Se não existe mapa principal, mostra alerta
          Alert.alert(
            'Mapa Principal Necessário',
            'Você precisa ter um mapa astral principal antes de criar um mapa extra.',
            [
              {
                text: 'OK',
                onPress: () => props.navigation.navigate('RegisterScreen'),
                style: 'default'
              }
            ]
          );
        }
      })
      .catch(error => {
        console.error('Erro ao verificar mapa principal:', error);
        Alert.alert('Erro', 'Não foi possível verificar seu mapa astral.');
      });
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Header com Avatar */}
      <View style={styles.drawerHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image 
              source={zodiacImages[zodiacSign]}
              style={styles.avatar}
            />
            <View style={styles.statusDot} />
          </View>
          <View style={styles.userTextInfo}>
            <Text style={styles.userName}>{userData?.name || "Usuário"}</Text>
            <Text style={styles.userEmail}>{userData?.email || ''}</Text>
          </View>
        </View>
      </View>

      {/* Items padrão do Drawer */}
      <View style={styles.drawerContent}>
        <DrawerItem
          label="Home"
          icon={({ focused }) => (
            <Icon name="home" color={currentRoute === 'Home' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Home')}
          style={[
            styles.drawerItem,
            currentRoute === 'Home' && styles.drawerItemActive
          ]}
          labelStyle={[
            styles.drawerLabel,
            currentRoute === 'Home' && styles.drawerLabelActive
          ]}
        />

        <DrawerItem
          label="Mapa Astral"
          icon={({ focused }) => (
            <Icon name="stars" color={currentRoute === 'Mapa Astral' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Mapa Astral')}
          style={[
            styles.drawerItem,
            currentRoute === 'Mapa Astral' && styles.drawerItemActive
          ]}
          labelStyle={[
            styles.drawerLabel,
            currentRoute === 'Mapa Astral' && styles.drawerLabelActive
          ]}
        />

        <DrawerItem
          label="Minha Conta"
          icon={({ focused }) => (
            <Icon name="stars" color={currentRoute === 'Minha Conta' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Minha Conta')}
          style={[styles.drawerItem, currentRoute === 'Minha Conta' && styles.drawerItemActive]}
          labelStyle={[styles.drawerLabel, currentRoute === 'Minha Conta' && styles.drawerLabelActive]}
        />

        <DrawerItem
          label="Minhas Compras"
          icon={({ focused }) => (
            <Icon 
              name="shopping-cart" 
              color={currentRoute === 'Minhas Compras' ? '#FFFFFF' : '#7A708E'} 
              size={24} 
            />
          )}
          onPress={() => props.navigation.navigate('Minhas Compras')}
          style={[
            styles.drawerItem,
            currentRoute === 'Minhas Compras' && styles.drawerItemActive
          ]}
          labelStyle={[
            styles.drawerLabel,
            currentRoute === 'Minhas Compras' && styles.drawerLabelActive
          ]}
        />

        {/* Grupo Sinastria */}
        <View style={styles.drawerGroup}>
          <DrawerItem
            label="Sinastria"
            icon={({ focused }) => (
              <Icon name="favorite" color={currentRoute === 'Sinastria' ? '#FFFFFF' : '#7A708E'} size={24} />
            )}
            onPress={() => props.navigation.navigate('Sinastria')}
            style={[
              styles.drawerItem,
              currentRoute === 'Sinastria' && styles.drawerItemActive
            ]}
            labelStyle={[
              styles.drawerLabel,
              currentRoute === 'Sinastria' && styles.drawerLabelActive
            ]}
          />
          <DrawerItem
            label="Mapa Extra"
            icon={({ focused }) => (
              <Icon name="add-circle-outline" color={currentRoute === 'CreateExtraChart' ? '#FFFFFF' : '#7A708E'} size={24} />
            )}
            onPress={handleCreateExtraChart}
            style={[
              styles.drawerItem,
              styles.nestedItem,
              currentRoute === 'CreateExtraChart' && styles.drawerItemActive
            ]}
            labelStyle={[
              styles.drawerLabel,
              currentRoute === 'CreateExtraChart' && styles.drawerLabelActive
            ]}
          />
        </View>

        <DrawerItem
          label="Casas"
          icon={({ focused }) => (
            <Icon name="stars" color={currentRoute === 'Casas' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Casas')}
          style={[
            styles.drawerItem,
            currentRoute === 'Casas' && styles.drawerItemActive
          ]}
          labelStyle={[
            styles.drawerLabel,
            currentRoute === 'Casas' && styles.drawerLabelActive
          ]}
        />

        <DrawerItem
          label="Sair"
          icon={({ focused }) => (
            <Icon name="logout" color={'#7A708E'} size={24} />
          )}
          onPress={props.handleLogout}
          style={styles.drawerItem}
          labelStyle={styles.drawerLabel}
        />
      </View>
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
      Alert.alert('Erro', 'Não foi possível fazer logout.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExtraChart = () => {
    // Verifica se já existe um mapa astral principal
    StorageService.getMainAstralMap()
      .then(mainMap => {
        if (mainMap) {
          // Se existe mapa principal, navega direto para criar mapa extra
          navigation.navigate('CreateExtraChart');
        } else {
          // Se não existe mapa principal, mostra alerta
          Alert.alert(
            'Mapa Principal Necessário',
            'Você precisa ter um mapa astral principal antes de criar um mapa extra.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('RegisterScreen'),
                style: 'default'
              }
            ]
          );
        }
      })
      .catch(error => {
        console.error('Erro ao verificar mapa principal:', error);
        Alert.alert('Erro', 'Não foi possível verificar seu mapa astral.');
      });
  };

  return (
    <>
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawerContent {...props} handleLogout={handleLogout} />
        )}
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
              <Icon name="stars" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen
          name="Sinastria"
          component={SinastriaStack}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="favorite" color={color} size={size} />
            ),
            title: "Sinastria"
          }}
        />

        <Drawer.Screen
          name="Mapa Extra"
          component={CreateExtraChartScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="favorite" color={color} size={size} />
            ),
            title: "Mapa Extra"
          }}
          listeners={{
            drawerItemPress: (e) => {
              // Previne navegação padrão
              e.preventDefault();
              handleCreateExtraChart();
            }
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
          name="Minha Conta"
          component={MyAccountScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="stars" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen
          name="Minhas Compras"
          component={MyPurchasesScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="shopping-cart" color={color} size={size} />
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

      {isLoading && <LoadingOverlay message="Saindo..." />}
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
  userEmail: {
    color: '#7A708E',
    fontSize: 14,
  },
  drawerContent: {
    flex: 1,
  },
  drawerItem: {
    borderRadius: 0,
    marginHorizontal: 0,
  },
  drawerItemActive: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
  },
  drawerLabel: {
    color: '#7A708E',
    fontSize: 16,
  },
  drawerLabelActive: {
    color: '#FFFFFF',
  },
  drawerGroup: {
    marginLeft: 0,
  },
  nestedItem: {
    marginLeft: 30,
    opacity: 0.8,
  },
});

export default App;
