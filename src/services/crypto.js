import CryptoJS from 'react-native-crypto-js';

class CryptoService {
  // Chave de exemplo - idealmente deve vir das variáveis de ambiente
  SECRET_KEY = 'astral_match_secret_key_2024';

  encrypt(text) {
    try {
      if (!text) return null;
      
      // Criptografa usando AES
      const encrypted = CryptoJS.AES.encrypt(text, this.SECRET_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Erro na criptografia:', error);
      return null;
    }
  }

  decrypt(encryptedText) {
    try {
      if (!encryptedText) return null;
      
      // Descriptografa usando AES
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Erro na descriptografia:', error);
      return null;
    }
  }
}

export default new CryptoService();