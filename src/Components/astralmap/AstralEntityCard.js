import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

const NetworkGraph = ({ data }) => {
  // data = [{ name, degree }]
  const radius = 60;
  const centerX = 90, centerY = 90;
  const pointRadius = 18;
  const total = data.length;
  const graphPoints = data.map((item, i) => {
    const angle = (2 * Math.PI * i) / total;
    return {
      x: centerX + radius * Math.cos(angle - Math.PI / 2),
      y: centerY + radius * Math.sin(angle - Math.PI / 2),
      name: item.name,
      degree: item.degree,
    };
  });

  return (
    <Svg height="180" width="180">
      {/* Linhas de conexão */}
      {graphPoints.map((p, i) => (
        <Line
          key={`line-${i}`}
          x1={p.x}
          y1={p.y}
          x2={graphPoints[(i + 1) % total].x}
          y2={graphPoints[(i + 1) % total].y}
          stroke="#6D44FF"
          strokeWidth="2"
          opacity={0.5}
        />
      ))}
      {/* Pontos */}
      {graphPoints.map((p, i) => (
        <React.Fragment key={`circle-${i}`}>
          <Circle
            cx={p.x}
            cy={p.y}
            r={pointRadius}
            fill="#6D44FF"
            opacity={0.7}
          />
          <SvgText
            x={p.x}
            y={p.y + 6}
            fontSize="13"
            fontWeight="bold"
            fill="#FFD700"
            textAnchor="middle"
          >
            {p.degree}°
          </SvgText>
          <SvgText
            x={p.x}
            y={p.y + pointRadius + 15}
            fontSize="10"
            fill="#fff"
            textAnchor="middle"
          >
            {p.name}
          </SvgText>
        </React.Fragment>
      ))}
      {/* Centro */}
      <Circle cx={centerX} cy={centerY} r={8} fill="#FFD700" />
    </Svg>
  );
};

const AstralEntityCard = ({ item, imageMap, items }) => {
  // Função para extrair graus e nomes dos itens recebidos


  return (
    <>
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.imageContainer}>
            <Image
              source={imageMap[item.sign.name.toLowerCase()]}
              style={styles.image}
            />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.astroName}>{item.astral_entity.name}</Text>
            <Text style={styles.horoscopeName}>
              {item.sign.name} - {item.degree}º
            </Text>
          </View>
        </View>
        {item.astral_entity.explanation && (
          <Text style={styles.explanation}>{item.astral_entity.explanation}</Text>
        )}
        <Text style={styles.description}>{item.description}</Text>
      </View>


    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 10,
  },
  astroName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 2,
  },
  horoscopeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'lightblue',
  },
  explanation: {
    fontSize: 12,
    color: 'lightblue',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  // --- Novo estilo para o card do gráfico de rede
  networkCard: {
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  networkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
});

export default AstralEntityCard;
