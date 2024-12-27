import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

const HomeScreen = () => {
  return (
    <View style={styles.container}>

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={styles.button}
          onPress={async () => {
            console.log('Apple Sign In');
            try {
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
              
              console.log(credential);

            } catch (e) {
              if (e.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
                console.log('User canceled the sign-in flow');
              } else {
                console.log('otros errores');
                // handle other errors
              }
            }
          }}
        />
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 44,
  },
});


export default HomeScreen;