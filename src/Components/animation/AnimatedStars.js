import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const AnimatedStars = () => {
  const translateY1 = new Animated.Value(0);
  const translateY2 = new Animated.Value(0);
  const translateY3 = new Animated.Value(0);
  const translateY4 = new Animated.Value(0);
  const constellationOpacity = new Animated.Value(1);

  // Definições de constelações (usando valores absolutos)
  const constellations = [
    // Ursa Menor
    [
      { x: 0, y: 0 }, { x: 30, y: 30 }, { x: 60, y: 45 },
      { x: 90, y: 60 }, { x: 75, y: 90 }, { x: 45, y: 105 },
      { x: 15, y: 75 }
    ],
    // Órion
    [
      { x: 0, y: 0 }, { x: 30, y: 15 }, { x: 60, y: 30 },
      { x: 45, y: 60 }, { x: 30, y: 90 }, { x: 15, y: 120 },
      { x: 75, y: 75 }
    ],
    // Cruz do Sul
    [
      { x: 30, y: 0 }, { x: 30, y: 60 },
      { x: 0, y: 30 }, { x: 60, y: 30 }
    ],
    // Escorpião
    [
      { x: 0, y: 0 }, { x: 20, y: 20 }, { x: 40, y: 25 },
      { x: 60, y: 20 }, { x: 80, y: 30 }, { x: 85, y: 50 },
      { x: 75, y: 70 }, { x: 65, y: 90 }
    ],
    // Cygnus (Cisne)
    [
      { x: 40, y: 0 }, { x: 40, y: 60 },
      { x: 0, y: 30 }, { x: 80, y: 30 },
      { x: 20, y: 45 }, { x: 60, y: 45 }
    ],
    // Cassiopeia
    [
      { x: 0, y: 0 }, { x: 20, y: 20 },
      { x: 40, y: 10 }, { x: 60, y: 30 },
      { x: 80, y: 20 }
    ],
    // Leão
    [
      { x: 0, y: 0 }, { x: 20, y: 10 },
      { x: 40, y: 0 }, { x: 30, y: 20 },
      { x: 50, y: 30 }, { x: 60, y: 50 }
    ],
    // Ursa Maior
    [
      { x: 0, y: 0 }, { x: 20, y: 0 }, { x: 40, y: 10 },
      { x: 60, y: 20 }, { x: 80, y: 40 }, { x: 70, y: 60 },
      { x: 50, y: 70 }
    ],
    // Sagitário
    [
      { x: 0, y: 30 }, { x: 20, y: 20 }, { x: 40, y: 0 },
      { x: 60, y: 20 }, { x: 80, y: 30 }, { x: 40, y: 40 },
      { x: 30, y: 60 }
    ],
    // Gêmeos
    [
      { x: 0, y: 0 }, { x: 20, y: 20 }, { x: 30, y: 40 },
      { x: 40, y: 60 }, { x: 60, y: 20 }, { x: 70, y: 40 },
      { x: 80, y: 60 }
    ],
    // Andrômeda
    [
      { x: 0, y: 0 }, { x: 20, y: 10 }, { x: 40, y: 15 },
      { x: 60, y: 10 }, { x: 80, y: 0 }, { x: 100, y: 10 }
    ],
    // Touro
    [
      { x: 0, y: 0 }, { x: 20, y: 20 }, { x: 40, y: 25 },
      { x: 60, y: 20 }, { x: 30, y: 40 }, { x: 50, y: 50 }
    ]
  ];

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY1, {
              toValue: height,
              duration: 100000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY1, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY2, {
              toValue: height,
              duration: 70000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY2, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY3, {
              toValue: height,
              duration: 50000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY3, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY4, {
              toValue: height,
              duration: 200000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY4, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(constellationOpacity, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(constellationOpacity, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
          ])
        ),
      ]).start();
    };

    animate();
  }, []);

  const createConstellation = (baseX, baseY, groupId, scale = 1) => {
    const shuffled = [...constellations].sort(() => 0.5 - Math.random());
    const selectedConstellations = shuffled.slice(0, 1);
    
    // Posições aleatórias para cada constelação
    const randomX = Math.random() * (width - 200);
    const randomY = Math.random() * (height - 200);
    
    return selectedConstellations.map((constellation, constellationIndex) => 
      constellation.map((star, starIndex) => (
        <View
          key={`const-${groupId}-${constellationIndex}-${starIndex}-${randomX}-${randomY}`}
          style={[
            styles.star,
            {
              width: 3,
              height: 3,
              left: randomX + (star.x * scale),
              top: randomY + (star.y * scale),
              backgroundColor: 'white',
            },
          ]}
        />
      ))
    ).flat();
  };

  const createFallingConstellations = (count) => {
    const constellationElements = [];
    for (let i = 0; i < count; i++) {
      const scale = 0.6 + Math.random() * 0.4;
      constellationElements.push(...createConstellation(0, 0, `group-${i}-${Date.now()}`, scale));
    }
    return constellationElements;
  };

  const createStars = (count, size) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const left = Math.random() * width;
      const top = Math.random() * height;
      const timestamp = Date.now(); // Adiciona timestamp para garantir unicidade
      
      stars.push(
        <View
          key={`star-${size}-${i}-${timestamp}-a`}
          style={[
            styles.star,
            {
              width: size,
              height: size,
              left,
              top,
            },
          ]}
        />,
        <View
          key={`star-${size}-${i}-${timestamp}-b`}
          style={[
            styles.star,
            {
              width: size,
              height: size,
              left,
              top: top - height,
            },
          ]}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.constellationContainer,
          {
            opacity: constellationOpacity,
          },
        ]}
      >
        {createFallingConstellations(3)}
      </Animated.View>

      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [{ translateY: translateY1 }],
          },
        ]}
      >
        {createStars(50, 1)}
      </Animated.View>
      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [{ translateY: translateY2 }],
          },
        ]}
      >
        {createStars(30, 2)}
      </Animated.View>
      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [{ translateY: translateY3 }],
          },
        ]}
      >
        {createStars(20, 3)}
      </Animated.View>
      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [{ translateY: translateY4 }],
          },
        ]}
      >
        {createStars(200, 1)}
      </Animated.View>
      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [{ translateY: translateY4 }],
          },
        ]}
      >
        {createStars(200, 1)}
      </Animated.View>
      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [{ translateY: translateY4 }],
          },
        ]}
      >
        {createStars(100, 1)}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 0,
    elevation: 0,
  },
  starContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  constellationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 50,
  },
});

export default AnimatedStars;