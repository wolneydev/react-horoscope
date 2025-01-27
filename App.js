// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Importando as telas
import SplashScreen from './src/screens/SplashScreen';
import FormScreen from './src/screens/FormScreen';
import AstralMapScreen from './src/screens/AstralMapScreen';
import HomeScreen from './src/screens/HomeScreen';  // HomeScreen com Mandala agora
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CompatibilityScreen from './src/screens/CompatibilityScreen';
import GreetingsScreen from './src/screens/GreetingsScreen';

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
        name="HomeScreen"
        component={HomeScreen} // HomeScreen com Mandala agora
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GreetingsScreen"
        component={GreetingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AstralMapScreen"
        component={AstralMapScreen}
        options={{ headerShown: false }}
      />    
      <Stack.Screen
        name="FormScreen"
        component={FormScreen}
        options={{ title: 'Digite seus dados' }}
      />
      <Stack.Screen
        name="Compatibility"
        component={CompatibilityScreen}
        options={{ title: 'Compatibilidade Astral' }}
      />
    </Stack.Navigator>

  );
}

// Menu Drawer Navigator
function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E1B29' },
        headerTintColor: 'white',
        drawerStyle: { backgroundColor: '#1E1B29' },
        drawerActiveTintColor: 'white',
        drawerInactiveTintColor: '#fff',
      }}
    >
      <Drawer.Screen
        name="Mapa Astral"
        component={MainStack}
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
        name="Sair"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="stars" color={color} size={size} />
          ),
        }}
      />      
    </Drawer.Navigator>
  );
}

// Componente principal
const App = () => {
  return (
    <NavigationContainer>
      <AppDrawer />
    </NavigationContainer>
  );
};

export default App;
