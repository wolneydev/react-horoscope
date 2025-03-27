import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import { COLORS, SPACING, FONTS } from '../styles/theme';

const astros = [
  {
    id: '0',
    name: 'Sol',
    description: 'O Sol representa a essência, identidade e força vital de uma pessoa. Ele revela sua verdadeira natureza, autoestima e propósito de vida. Sua posição no mapa astral influencia diretamente sua energia, determinação e como você se vê e é visto pelos outros.',
    image: require('../assets/images/entities/sun.jpg'),
  },
  {
    id: '1',
    name: 'Ascendente',
    description: 'O Ascendente representa a primeira impressão que os outros têm de você e como você inicia novas experiências. Ele influencia sua autoapresentação, adaptação a mudanças e a forma como interage com o mundo exterior, moldando sua percepção pública.',
    image: require('../assets/images/entities/ascendant.jpg'),
  },
  {
    id: '2',
    name: 'Descendente',
    description: 'O Descendente representa a maneira como você se relaciona com os outros e o tipo de parceiro ou parceria que mais lhe atrai. Ele é oposto ao seu Ascendente e reflete suas necessidades em relacionamentos, sejam eles amorosos, profissionais ou sociais.',
    image: require('../assets/images/entities/descendant.jpg'),
  },
  {
    id: '3',
    name: 'Meio do Céu',
    description: 'O Meio do Céu (MC) é um ponto crucial no mapa astral, ligado à sua carreira, imagem pública e propósito de vida. Ele indica sua vocação, as ambições profissionais e a forma como o mundo exterior percebe você. É um indicador de seu caminho de sucesso e realização.',
    image: require('../assets/images/entities/midheaven.jpg'),
  },
  {
    id: '4',
    name: 'Fundo do Céu',
    description: 'O Fundo do Céu (IC) simboliza suas raízes, família, infância e vida privada. Representa a base emocional e psicológica que sustenta sua jornada, incluindo sua relação com a família, memórias de infância e a ideia de lar e segurança.',
    image: require('../assets/images/entities/nadir.jpg'),
  },
  {
    id: '5',
    name: 'Júpiter',
    description: 'Júpiter é o planeta da expansão, sorte e sabedoria. Ele rege o crescimento pessoal, a espiritualidade, o otimismo e as oportunidades. Onde Júpiter está posicionado em seu mapa astral indica as áreas da vida em que você tem mais facilidade para crescer e prosperar.',
    image: require('../assets/images/entities/jupiter.jpg'),
  },
  {
    id: '6',
    name: 'Netuno',
    description: 'Netuno é o planeta dos sonhos, ilusões, espiritualidade e intuição. Ele rege a imaginação, a conexão com o divino e a sensibilidade emocional. Em seu mapa astral, Netuno pode indicar áreas onde há tendência a ilusões ou inspirações artísticas e espirituais.',
    image: require('../assets/images/entities/neptune.jpg'),
  },
  {
    id: '7',
    name: 'Saturno',
    description: 'Saturno é o planeta da disciplina, responsabilidade e aprendizado. Ele rege o tempo, as limitações e as lições que precisam ser aprendidas ao longo da vida. Sua posição no mapa astral mostra onde você pode enfrentar desafios, mas também onde pode alcançar grandeza através do esforço e persistência.',
    image: require('../assets/images/entities/saturn.jpg'),
  },
  {
    id: '8',
    name: 'Marte',
    description: 'Marte representa ação, energia, desejo e impulsividade. É o planeta da iniciativa e da coragem, indicando a maneira como você age, luta pelos seus objetivos e lida com desafios. Sua posição no mapa astral revela sua abordagem para alcançar o que deseja e como lida com conflitos.',
    image: require('../assets/images/entities/mars.jpg'),
  },
  {
    id: '9',
    name: 'Vênus',
    description: 'Vênus é o planeta do amor, beleza e prazer. Ele rege os relacionamentos, os valores pessoais, a estética e a forma como você expressa afeto. A posição de Vênus no seu mapa astral indica seu estilo de amar e suas preferências em termos de relacionamentos e conforto material.',
    image: require('../assets/images/entities/venus.jpg'),
  },
  {
    id: '10',
    name: 'Mercúrio',
    description: 'Mercúrio é o planeta da comunicação, do intelecto e do pensamento lógico. Ele rege a maneira como você processa informações, aprende e se expressa. Sua posição no mapa astral mostra como você se comunica, raciocina e toma decisões.',
    image: require('../assets/images/entities/mercury.jpg'),
  },
  {
    id: '11',
    name: 'Urano',
    description: 'Urano é o planeta da inovação, das mudanças radicais e da rebeldia. Ele rege a originalidade, a liberdade e a quebra de padrões. Sua posição no mapa astral revela onde você busca independência e progresso, além das áreas onde você pode se destacar com ideias revolucionárias.',
    image: require('../assets/images/entities/uranus.jpg'),
  },
  {
    id: '12',
    name: 'Plutão',
    description: 'Plutão é o planeta da transformação, poder e renascimento. Ele rege crises profundas, regeneração e a necessidade de mudanças intensas. Sua posição no mapa astral indica onde você pode experimentar processos de morte e renascimento simbólicos, levando ao crescimento e empoderamento pessoal.',
    image: require('../assets/images/entities/pluto.jpg'),
  },
];

const AstroItem = ({ name, description, image }) => (
  <View style={styles.itemContainer}>
    <Image source={image} style={styles.image} />
    <View style={styles.textContainer}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </View>
);

const AstrosList = () => (
  <FlatList
    data={astros}
    renderItem={({ item }) => (
      <AstroItem name={item.name} description={item.description} image={item.image} />
    )}
    keyExtractor={item => item.id}
  />
);

const EntitiesScreen = () => {
  const memoStars = useMemo(() => <AnimatedStars />, []);

  return (
    <View style={styles.container}>
      {memoStars}
      <AstrosList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: SPACING.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,  
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.MEDIUM,
  },
  textContainer: {
    flex: 1,
    padding: SPACING.LARGE,
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: SPACING.MEDIUM,
  },
  name: {
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    color: COLORS.HIGHLIGHT,
  },
  description: {
    fontSize: FONTS.SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
});

export default EntitiesScreen;