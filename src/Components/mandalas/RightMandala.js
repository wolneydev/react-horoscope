import React from 'react';
import { View, StyleSheet } from 'react-native';

const RightMandala = () => {
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
                  { rotate: `${index * 12}deg` },  // Ajusta a rotação de cada pétala
                  { translateX: 17 },  // Ajusta a distância das pétalas do centro
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

  pattern: {
    width: 1,
    height: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petal: {
    width: 1,  // Menor largura para mais pétalas
    height: 100, // Ajuste na altura
    backgroundColor: 'gray', // Cor amarela para as pétala
    borderShadowColor: '#FFD700',
    borderRadius: 9,
    position: 'absolute',
    top: '1%', // Move as pétalas para o centro verticalmente
    left: '1%', // Move as pétalas para o centro horizontalmente
    marginTop:4, // Compensa a altura da pétala para centralizar
    marginLeft: 160, // Compensa a largura da pétala para centralizar
    shadowColor: 'gray', // Cor amarela para a sombra
    shadowOpacity: 0.7,
    shadowOffset: { width: 170, height: 0 },
    shadowRadius: 4,
  },  
});

export default RightMandala;
