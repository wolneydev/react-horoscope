import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import BuyCreditsButton from '../Components/BuyCreditsButton';
import StripeService from '../services/StripeService';

const CreditsScreen = () => {

  useEffect(() => {
    StripeService.initializeStripe();
  }, []);

  const handlePurchaseSuccess = (result) => {
    console.log('Compra realizada:', result);
  };

  return (
    <View style={styles.container}>
      <AnimatedStars />
      
      <View style={styles.content}>
        <Text style={styles.title}>Créditos</Text>
        <Text style={styles.currentCredits}>
        </Text>

        <View style={styles.packagesContainer}>
          <BuyCreditsButton
            amount={9.90}
            credits={100}
            onSuccess={handlePurchaseSuccess}
            style={styles.creditButton}
          />

          <BuyCreditsButton
            amount={24.90}
            credits={300}
            onSuccess={handlePurchaseSuccess}
            style={styles.creditButton}
          />

          <BuyCreditsButton
            amount={49.90}
            credits={700}
            onSuccess={handlePurchaseSuccess}
            style={styles.creditButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  currentCredits: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  packagesContainer: {
    gap: 15,
  },
  creditButton: {
    backgroundColor: 'rgba(109, 68, 255, 0.25)',
    borderColor: 'rgba(109, 68, 255, 0.75)',
  },
});

export default CreditsScreen; 