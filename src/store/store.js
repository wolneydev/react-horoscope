import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  ACCESS_TOKEN: '@access_token',
  TOKEN_EXPIRATION: '@token_expiration',
  ASTRAL_MAP: '@astral_map',
};

// Token expira em 7 dias
const TOKEN_DURATION = (7 * 24 * 60 * 60 * 1000) - 25 * 1000 * 60 ; // 25 minutos antes do token expirar

class StorageService {

  async saveAccessToken(token) {
    try {
      const expiration = new Date().getTime() + TOKEN_DURATION;
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRATION, expiration.toString());
    } catch (error) {
      console.error('Erro ao salvar token:', error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const expiration = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRATION);
      
      if (!token || !expiration) return null;

      // Verifica se o token expirou
      const now = new Date().getTime();
      if (now > parseInt(expiration, 10)) {
        await this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Erro ao ler token:', error);
      return null;
    }
  }

  async clearToken() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.TOKEN_EXPIRATION
      ]);
    } catch (error) {
      console.error('Erro ao limpar token:', error);
    }
  }

  async isTokenValid() {
    try {
      const expiration = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRATION);
      if (!expiration) return false;

      const now = new Date().getTime();
      return now < parseInt(expiration, 10);
    } catch (error) {
      console.error('Erro ao verificar validade do token:', error);
      return false;
    }
  }

  // Métodos para usuário
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }

  async getUserData() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao ler dados do usuário:', error);
      throw error;
    }
  }


  // Método para salvar mapa astral
  async saveAstralMap(astralMap) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ASTRAL_MAP, JSON.stringify(astralMap));
    } catch (error) {
      console.error('Erro ao salvar mapa astral:', error);
      throw error;
    }
  }

  async getAstralMap() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ASTRAL_MAP);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao ler mapa astral:', error);
      throw error;
    }
  }

  // Método para logout
  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }

  // Método para verificar se usuário está logado
  async isLoggedIn() {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async isEmailVerified() {
    try {
      const userData = await this.getUserData();
      return userData.email_verified === true;
    } catch (error) {
      return false;
    }
  }
}

export default new StorageService();