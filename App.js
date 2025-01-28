// App.js
import React from 'react';
import "react-native-url-polyfill/auto";
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Importação necessária
import {
  StyleSheet,
  ScrollView,
} from 'react-native';
// Importando as telas
import SplashScreen from './src/screens/SplashScreen';
import FormScreen from './src/screens/FormScreen';
import AstralMapScreen from './src/screens/AstralMapScreen';
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CompatibilityScreen from './src/screens/CompatibilityScreen';
import GreetingsScreen from './src/screens/GreetingsScreen';
import { enableScreens } from 'react-native-screens';

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
        name="HomeScreen"
        component={HomeScreen}
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
        name="DrawerScreens"
        component={AppDrawer}
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
  const navigation = useNavigation();

  const handleLogout = () => {
    // Navega de volta para a tela de login
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  return (
    <Drawer.Navigator
    detachInactiveScreens={false} // Altere para false
    screenOptions={{
      headerStyle: { backgroundColor: '#141527' },
      headerTintColor: 'white',
      drawerStyle: { backgroundColor: '#141527' },
      drawerActiveTintColor: 'white',
      drawerInactiveTintColor: '#fff',
    }}
  >
      <Drawer.Screen
        name="HomeScreen"
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
        name="Sair"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="logout" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
    </Drawer.Navigator>
  );
}

// Componente principal
const App = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >   
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </GestureHandlerRootView>
    </ScrollView> 
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content:{
    flex: 1,
  }
});
export default App;
