import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';

/**
 * Componente de cabeçalho com informações do usuário e avatar
 * 
 * @param {boolean} showWelcome - Se deve mostrar a mensagem de boas-vindas (apenas para HomeScreen)
 * @param {object} style - Estilos adicionais para o container
 */
const UserInfoHeader = ({ 
  showWelcome = false,
  style
}) => {
  const navigation = useNavigation();
  const { userData } = useUser();
  const [zodiacSign, setZodiacSign] = useState("default");

  // Objeto de mapeamento de imagens
  const zodiacImages = {
    aries: require('../assets/images/sign/aries.jpg'),
    taurus: require('../assets/images/sign/taurus.jpg'),
    gemini: require('../assets/images/sign/gemini.jpg'),
    cancer: require('../assets/images/sign/cancer.jpg'),
    leo: require('../assets/images/sign/leo.jpg'),
    virgo: require('../assets/images/sign/virgo.jpg'),
    libra: require('../assets/images/sign/libra.jpg'),
    scorpio: require('../assets/images/sign/scorpio.jpg'),
    sagittarius: require('../assets/images/sign/sagittarius.jpg'),
    capricorn: require('../assets/images/sign/capricorn.jpg'),
    aquarius: require('../assets/images/sign/aquarius.jpg'),
    pisces: require('../assets/images/sign/pisces.jpg'),
    default: require('../assets/images/sign/virgo.jpg'), // Imagem fallback
  };

  useEffect(() => {
    if (userData?.birthData?.day && userData?.birthData?.month) {
      const sign = getZodiacSign(userData.birthData.day, userData.birthData.month);
      setZodiacSign(sign);
    }
  }, [userData]);

  // Função para identificar o signo
  const getZodiacSign = (day, month) => {
    const zodiacSigns = [
      { sign: "capricorn", start: "12-22", end: "01-19" },
      { sign: "aquarius", start: "01-20", end: "02-18" },
      { sign: "pisces", start: "02-19", end: "03-20" },
      { sign: "aries", start: "03-21", end: "04-19" },
      { sign: "taurus", start: "04-20", end: "05-20" },
      { sign: "gemini", start: "05-21", end: "06-20" },
      { sign: "cancer", start: "06-21", end: "07-22" },
      { sign: "leo", start: "07-23", end: "08-22" },
      { sign: "virgo", start: "08-23", end: "09-22" },
      { sign: "libra", start: "09-23", end: "10-22" },
      { sign: "scorpio", start: "10-23", end: "11-21" },
      { sign: "sagittarius", start: "11-22", end: "12-21" },
    ];

    const birthDate = `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    for (const zodiac of zodiacSigns) {
      if (
        (birthDate >= zodiac.start && month === parseInt(zodiac.start.split("-")[0])) ||
        (birthDate <= zodiac.end && month === parseInt(zodiac.end.split("-")[0]))
      ) {
        return zodiac.sign;
      }
    }

    return "default";
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={zodiacImages[zodiacSign]}
            style={styles.avatar}
          />
          <View style={styles.statusDot} />
        </View>
        <View style={styles.userTextInfo}>
          {showWelcome && (
            <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
          )}
          <Text style={styles.userName}>{userData?.name || "Usuário"}</Text>
          {!showWelcome && userData?.email && (
            <Text style={styles.userEmail}>{userData.email}</Text>
          )}
          <TouchableOpacity 
            style={styles.tokensContainer}
            onPress={() => navigation.navigate('AstralTokens')}
          >
            <Text style={styles.tokensText}>{userData?.astral_tokens || 0}</Text>
            <Text style={styles.tokensLabel}>Astral Tokens</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#6D44FF',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#141527',
  },
  userTextInfo: {
    flex: 1,
  },
  welcomeText: {
    color: '#7A708E',
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#7A708E',
    fontSize: 12,
    marginTop: 2,
  },
  tokensContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  tokensText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  tokensLabel: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default UserInfoHeader; 