// App.js
import React from 'react';
import "react-native-url-polyfill/auto";
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import { UserProvider } from './src/contexts/UserContext';

// Importando as telas
import SplashScreen from './src/screens/SplashScreen';
import AstralMapScreen from './src/screens/AstralMapScreen';
import IndexScreen from './src/screens/IndexScreen';
import HomeScreen from './src/screens/HomeScreen';
import EntitiesScreen from './src/screens/EntitiesScreen';
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
import UserListScreen from './src/screens/UserListScreen'; 
import PhotoPicker from './src/Components/PhotoPicker';
import EditProfileScreen from './src/screens/EditProfileScreen';
import LearningScreen from './src/screens/LearningScreen';
import DiaryScreen from './src/screens/DiaryScreen';
import AstralTokensScreen from './src/screens/AstralTokensScreen';

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
        name="IndexScreen"
        component={IndexScreen}
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
        name="EntitiesScreen"
        component={EntitiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AstralMapScreen"
        component={AstralMapScreen}
        options={{ headerShown: false }}
      />
      {/* A tela de compatibilidade estava registrada como Drawer.Screen, mas deixaremos conforme seu código original */}
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
        options={{ 
          title: 'Criar Novo Mapa',
          headerStyle: {
            backgroundColor: '#141527',
            borderWidth: 1,
            borderColor: 'rgba(109, 68, 255, 0.2)'
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={AppDrawer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SynastryDesambiguationScreen"
        component={SynastryDesambiguationScreen}
        options={{ 
          title: 'Sinastria',
          headerStyle: {
            backgroundColor: '#141527',
            borderWidth: 1,
            borderColor: 'rgba(109, 68, 255, 0.2)'
          },
          headerTintColor: 'white',
        }}
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
      <Stack.Screen
        name="LearningScreen"
        component={LearningScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserListScreen"
        component={UserListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
          name="PhotoPicker" 
          component={PhotoPicker} 
        />      
       <Stack.Screen 
          name="EditProfileScreen" 
          component={EditProfileScreen} 
          options={{ headerShown: false }}
        />              
      <Stack.Screen
        name="DiaryScreen"
        component={DiaryScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AstralTokensScreen"
        component={AstralTokensScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Criar um Stack Navigator para as telas de Sinastria
function SinastriaStack() {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: {
          backgroundColor: '#141527',
          borderWidth: 1,
          borderColor: 'rgba(109, 68, 255, 0.2)'
        },
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen
        name="SynastryDesambiguation"
        component={SynastryDesambiguationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateExtraChart"
        component={CreateExtraChartScreen}
        options={{ 
          title: 'Criar Novo Mapa',
          headerShown: true
        }}
      />
    </Stack.Navigator>
  );
}

/** CustomDrawerContent é responsável por renderizar o conteúdo personalizado do Drawer */
function CustomDrawerContent(props) {
  const currentRoute = props.state.routeNames[props.state.index];

  return (
    <DrawerContentScrollView {...props}>
      {/* Header com Avatar */}
      <UserInfoHeader 
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

        {/* ITEM DE MENU PARA A SEÇÃO DE APRENDIZADO */}
        <DrawerItem
          label="Aprendizado"
          icon={({ focused }) => (
            <Icon name="book" color={currentRoute === 'Aprendizado' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Aprendizado')}
          style={[  
            styles.drawerItem,
            currentRoute === 'Aprendizado' && styles.drawerItemActive
          ]}
          labelStyle={[
            styles.drawerLabel,
            currentRoute === 'Aprendizado' && styles.drawerLabelActive
          ]}
        />

        {/* ITEM DE MENU PARA A LISTA DE USUÁRIOS */}
        <DrawerItem
          label="Social"
          icon={({ focused }) => (
            <Icon name="account-circle" color={currentRoute === 'Social' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Social')}
          style={[styles.drawerItem, currentRoute === 'Social' && styles.drawerItemActive]}
          labelStyle={[styles.drawerLabel, currentRoute === 'Social' && styles.drawerLabelActive]}
        />

        <DrawerItem
          label="Diário"
          icon={({ focused }) => (
            <Icon name="book" color={currentRoute === 'Diário' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Diário')}
          style={[styles.drawerItem, currentRoute === 'Diário' && styles.drawerItemActive]}
          labelStyle={[styles.drawerLabel, currentRoute === 'Diário' && styles.drawerLabelActive]}
        />  

        <DrawerItem
          label="Astral Tokens"
          icon={({ focused }) => (
            <Icon name="stars" color={currentRoute === 'Astral Tokens' ? '#FFFFFF' : '#7A708E'} size={24} />
          )}
          onPress={() => props.navigation.navigate('Astral Tokens')}
          style={[styles.drawerItem, currentRoute === 'Astral Tokens' && styles.drawerItemActive]}
          labelStyle={[styles.drawerLabel, currentRoute === 'Astral Tokens' && styles.drawerLabelActive]}
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
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await StorageService.clearAll();
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
          component={SynastryDesambiguationScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="favorite" color={color} size={size} />
            ),
            title: 'Sinastria',
            headerStyle: {
              backgroundColor: '#141527',
              borderWidth: 1,
              borderColor: 'rgba(109, 68, 255, 0.2)'
            },
            headerTintColor: 'white',
          }}
        />

        <Drawer.Screen
          name="Social"
          component={UserListScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="favorite" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen
          name="Diário"
          component={DiaryScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="book" color={color} size={size} />
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
          name="Entidades do Mapa Astral"
          component={EntitiesScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="stars" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen  
          name="Aprendizado"
          component={LearningScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="book" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen
          name="Personalizar Perfil"
          component={EditProfileScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="account-circle" color={color} size={size} />
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
          name="Astral Tokens"
          component={AstralTokensScreen}
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

      {isLoading && <LoadingOverlay message="Saindo..." />}
    </>
  );
}

// Componente vazio para o item "Sair"
const EmptyComponent = () => null;

// Componente principal
const App = () => {
  return (
    <UserProvider>
      <PortalProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <MainStack />
          </NavigationContainer>
        </GestureHandlerRootView>
      </PortalProvider>
    </UserProvider>
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
