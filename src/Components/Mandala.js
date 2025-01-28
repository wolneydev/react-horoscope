import React from 'react';
import { View, StyleSheet } from 'react-native';

const Mandala = () => {
  return (
    <View style={styles.mandala}>
      <View style={styles.pattern}>
        {[...Array(36)].map((_, index) => (  // Aumentamos as pétalas para 36
          <View
            key={index}
            style={[
              styles.petal,
              {
                transform: [
                  { rotate: `${index * 10}deg` },  // Ajusta a rotação de cada pétala
                  { translateX: 70 },  // Ajusta a distância das pétalas do centro
                ],
              },
            ]}
          />
        ))}
        {[...Array(36)].map((_, index) => (  // Aumentamos as pétalas para 36
          <View
            key={index}
            style={[
              styles.petal2,
              {
                transform: [
                  { rotate: `${index * 10}deg` },  // Ajusta a rotação de cada pétala
                  { translateX: 70 },  // Ajusta a distância das pétalas do centro
                ],
              },
            ]}
          />
        ))}        
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  mandala: {
    width: 100,  // Aumentando o tamanho da mandala
    height: 100, // Aumentando o tamanho da mandala
    borderRadius: 100, // Manter a borda arredondada
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#141527', // Cor lilás para a sombra
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  pattern: {
    width: 1,
    height: 100,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petal: {
    width: 1,  // Menor largura para mais pétalas
    height: 80, // Ajuste na altura
    backgroundColor: 'lightyellow', // Cor amarela para as pétalas
    borderRadius: 6,
    position: 'absolute',
    top: '1%', // Move as pétalas para o centro verticalmente
    left: '1000%', // Move as pétalas para o centro horizontalmente
    marginTop: -15, // Compensa a altura da pétala para centralizar
    marginLeft: -55, // Compensa a largura da pétala para centralizar
    shadowColor: 'gray', // Cor amarela para a sombra
    shadowOpacity: 0.7,
    shadowOffset: { width: 170, height: 0 },
    shadowRadius: 4,
  },
  petal2: {
    width: 1,  // Menor largura para mais pétalas
    height: 80, // Ajuste na altura
    backgroundColor: 'lightyellow', // Cor amarela para as pétalas
    borderRadius: 6,
    position: 'absolute',
    top: '1%', // Move as pétalas para o centro verticalmente
    left: '1000%', // Move as pétalas para o centro horizontalmente
    marginTop: -15, // Compensa a altura da pétala para centralizar
    marginLeft: 55, // Compensa a largura da pétala para centralizar
    shadowColor: 'gray', // Cor amarela para a sombra
    shadowOpacity: 0.7,
    shadowOffset: { width: 170, height: 0 },
    shadowRadius: 4,
  },  
});

export default Mandala;
