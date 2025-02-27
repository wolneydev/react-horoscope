import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CompatibilityHeader = ({
  averageCompatibility,
  getCompatibilityColor,
  getCompatibilityText,
  isExpanded,
  setIsExpanded,
}) => {
  return (
    <>
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View>
            <View style={styles.titleContainer}>
              <View style={styles.infoIconContainer}>
                <Icon name="favorite" size={24} color="#6D44FF" />
              </View>
              <Text style={styles.averageTitle}>Compatibilidade Total</Text>
            </View>
            <Text
              style={[
                styles.averageValue,
                averageCompatibility && {
                  color: getCompatibilityColor(averageCompatibility),
                  textShadowColor: `${getCompatibilityColor(averageCompatibility)}50`,
                },
              ]}
            >
              {averageCompatibility !== null
                ? `${averageCompatibility.toFixed(2)}%`
                : ''}
            </Text>
          </View>
        </View>
        {averageCompatibility !== null && (
          <Text style={styles.infoDescription}>
            {getCompatibilityText(averageCompatibility)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.infoCard}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.infoHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.infoIconContainer}>
              <Icon name="help-outline" size={24} color="#6D44FF" />
            </View>
            <Text style={styles.infoTitle}>Como funciona?</Text>
            <Icon
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color="#6D44FF"
            />
          </View>
        </View>
        {isExpanded && (
          <View>
            <Text style={styles.infoDescription}>
              A compatibilidade total é uma medida de quão bem os dois indivíduos
              se encaixam em termos de personalidade, valores e expectativas.
            </Text>
            <Text style={styles.infoDescription}>
              Ela é calculada com base em vários aspectos astrológicos, como
              signos, planetas e ascendentes. É uma média ponderada de todos os
              aspectos analisados.
            </Text>
            <Text style={styles.infoDescription}>
              Utilizamos também, os algoritmos de Sinastria. Para tanto a
              compatibilidade é calculada através de 3 fatores principais:
            </Text>
            <Text style={styles.infoDescriptionList}>
              - Aspectos (40% do total): Analisa os ângulos entre os planetas de
              ambos os mapas astrais, onde Conjunção, Sextil e Trígono são
              considerados aspectos positivos, enquanto Quadratura e Oposição
              são considerados aspectos desafiadores;
            </Text>
            <Text style={styles.infoDescriptionList}>
              - Elementos (30% do total) e; Casas (30% do total).
            </Text>
            <Text style={styles.infoDescriptionList}>
              - Elementos (30% do total): Avalia a compatibilidade entre Fogo,
              Terra, Ar e Água, onde a presença de elementos semelhantes ou
              complementares é considerada positiva enquanto elementos opostos
              podem indicar desafios e;
            </Text>
            <Text style={styles.infoDescriptionList}>
              - Casas (30% do total).: Analisa o posicionamento entre as casas
              astrológicas de ambos os mapas astrais, com foco nas áreas de vida
              que são mais relevantes para a relação - 1 (identidade), 7
              (relacionamentos) e 10 (status).
            </Text>
            <Text style={styles.infoDescription}>
              Um valor alto indica uma boa compatibilidade, enquanto um valor
              baixo pode sugerir desafios e dificuldades.
            </Text>
            <Text style={styles.infoDescription}>
              Abaixo estão os aspectos analisados para o cálculo da
              compatibilidade total.
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  averageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  averageValue: {
    fontSize: 32,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  infoTitle: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
  },
  infoDescription: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 22,
    marginTop: 12,
  },
  infoDescriptionList: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 22,
    marginTop: 12,
    marginLeft: 20,
  },
});

export default CompatibilityHeader;
