import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import ScreenMenuItemCard from '../Components/ScreenMenuItemCard';
import EmailVerificationGuard from '../Components/emailVerification/EmailVerificationGuard';
import UserInfoHeader from '../Components/UserInfoHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import InfoCard from '../Components/InfoCard';
import { SPACING } from '../styles/theme';

const LearningScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = route.params;
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  return (
    <EmailVerificationGuard>
      <View style={styles.container}>
        
        {memoStars}
        
        <View style={styles.content}>
          
          <View style={styles.header}>
            <InfoCard
              title="Aprenda sobre Astrologia"
              description="Aprenda sobre Astrologia com nossos tutoriais e artigos."
              icon="arrow-forward"
              isInfoExpanded={isInfoExpanded}
              setIsInfoExpanded={setIsInfoExpanded}
              expandable={true}
            />
          </View>

          {/* Cards de Navegação */}
          <View style={styles.cardsContainer}>

            {/* Entidades do Mapa Astral */}
            <ScreenMenuItemCard 
              title="Entidades do Mapa Astral"
              description="Veja os detalhes das entidades do mapa astral."
              icon="arrow-forward"
              disabled={!userData?.email_verified_at}
              onPress={() => navigation.navigate('Entidades do Mapa Astral')}
            />

          </View>
        </View>

      </View>
    </EmailVerificationGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  content: {
    flex: 1,
    padding: SPACING.LARGE,    
  },
  header: {
    marginBottom: SPACING.LARGE,
  },
  card: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardDescription: {
    color: '#bbb',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  cardIcon: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
});

export default LearningScreen;
