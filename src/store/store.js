import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  ACCESS_TOKEN: '@access_token',
  ASTRAL_MAP: '@astral_map',
};

class StorageService {
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

  // Métodos para token
  async saveAccessToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Erro ao ler token:', error);
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
}

export default new StorageService();