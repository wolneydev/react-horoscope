import { View } from 'react-native';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ComplementaryProfile from './src/Components/complementaryProfile';

import FormScreen from './src/screens/FormScreen'; 
import AstralMapScreen from './src/screens/AstralMapScreen';
const Stack = createStackNavigator();


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
