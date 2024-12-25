// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

// Importando as telas
import SplashScreen from './src/screens/SplashScreen';
import FormScreen from './src/screens/FormScreen';
import AstralMapScreen from './src/screens/AstralMapScreen';

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
          name="FormScreen" 
          component={FormScreen} 
          options={{ title: 'Digite seus dados' }}
        />
        <Stack.Screen 
          name="AstralMapScreen" 
          component={AstralMapScreen} 
          options={{ title: 'Seu Mapa Astral' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
