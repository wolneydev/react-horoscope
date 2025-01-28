import React, { useEffect } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';

const SpinningMandala = () => {
  const spinValue = new Animated.Value(0);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    const startSpinning = () => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 8000, // Uma rotação completa a cada 8 segundos
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    };

    startSpinning();
  }, []);

  return (
    <Animated.View style={[styles.mandala, { transform: [{ rotate: spin }] }]}>
      <Animated.View style={styles.pattern}>
        {[...Array(36)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.petal,
              {
                transform: [
                  { rotate: `${index * 10}deg` },
                  { translateX: 10 },
                ],
              },
            ]}
          />
        ))}
        {[...Array(36)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.petal2,
              {
                transform: [
                  { rotate: `${index * 10}deg` },
                  { translateX: 10 },
                ],
              },
            ]}
          />
        ))}        
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mandala: {
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
    shadowColor: 'rgba(109, 68, 255, 0.15)',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  pattern: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petal: {
    width: 1,
    height: 32,
    backgroundColor: 'lightyellow',
    borderRadius: 6,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -0.5,
    shadowColor: 'gray',
    shadowOpacity: 0.7,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
  },
  petal2: {
    width: 1,
    height: 32,
    backgroundColor: 'lightyellow',
    borderRadius: 6,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -0.5,
    shadowColor: 'gray',
    shadowOpacity: 0.7,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
  },
});

export default SpinningMandala;