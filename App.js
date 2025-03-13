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
import MyPurchasesScreen from './src/screens/MyPurchasesScreen';
import { PrivacyPolicyScreen, TermsOfUseScreen } from './src/screens/TermsScreen';
import { PortalProvider } from '@gorhom/portal';
import UserInfoHeader from './src/Components/UserInfoHeader';
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
  const [isLoading, setIsLoading] = useState(false);
  const currentRoute = props.state.routeNames[props.state.index];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedUserData = await StorageService.getUserData();
        setUserData(savedUserData);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

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

  return (
    <DrawerContentScrollView {...props}>
      {/* Header com Avatar */}
      <UserInfoHeader 
        userData={userData}
        showWelcome={false}
      />

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
          label="Minha Conta"
          icon={({ focused }) => (
            <Icon name="account-circle" color={currentRoute === 'Minha Conta' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Minha Conta')}
          style={[styles.drawerItem, currentRoute === 'Minha Conta' && styles.drawerItemActive]}
          labelStyle={[styles.drawerLabel, currentRoute === 'Minha Conta' && styles.drawerLabelActive]}
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
          }}
        />

        <Drawer.Screen
          name="Compatibilidade"
          component={CompatibilityScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="favorite" color={color} size={size} />
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
    <PortalProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </GestureHandlerRootView>
    </PortalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content:{
    flex: 1,
  },
  welcomeText: {
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
