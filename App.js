// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

// Importando as telas
import SplashScreen from './src/screens/SplashScreen';
import FormScreen from './src/screens/FormScreen'; 
import AstralMapScreen from './src/screens/AstralMapScreen';
import HomeScreen from './src/screens/HomeScreen';
import GreetingsScreen from './src/screens/GreetingsScreen';
import AstralMapDataFormScreen from './src/screens/auth/register/AstralMapDataFormScreen';
import CompatibilityScreen from './src/screens/CompatibilityScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen 
          name="SplashScreen" 
          component={SplashScreen} 
          options={{ headerShown: false }} // Oculta o header da splash
        />

        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen} 
          options={{ headerShown: false }} // Oculta o header da splash
        />
        <Stack.Screen
          name="GreetingsScreen"
          component={GreetingsScreen}
          options={{ headerShown: false }} // Oculta o header da splash
        />
        <Stack.Screen
          name="AstralMapDataFormScreen"
          component={AstralMapDataFormScreen}
          options={{ headerShown: false }} // Oculta o header da splash
        />

        <Stack.Screen 
          name="FormScreen" 
          component={FormScreen} 
          options={{ title: 'Digite seus dados' }}
        />
        <Stack.Screen 
          name="AstralMapScreen" 
          component={AstralMapScreen} 
          options={{ title: 'Seu Mapa Astral' }}
        />
       <Stack.Screen name="Compatibility" component={CompatibilityScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
