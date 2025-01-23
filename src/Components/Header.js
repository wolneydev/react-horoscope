import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Astral Match</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'left',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    elevation: 4,
    shadowColor: '#6D44FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    marginLeft: 16,
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default Header;