import api from './api';
import StorageService from '../store/store';

class UserDataRefreshService {
  static async refreshUserData() {
    try {
      console.log('Iniciando atualização de dados do usuário');
      
      const token = await StorageService.getAccessToken();

      const response = await api.get(`users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const { status, data } = response.data;

      if (status === 'success') {
        // Preparando dados do usuário para salvar localmente
        const userData = {
          has_profile_photo: data.has_profile_photo,
          profile_photo_url: data.profile_photo_url,
          has_contacts: data.has_contacts,
          contacts: data.contacts,
          astral_tokens: data.astral_tokens,
          extra_maps_max_number: data.extra_maps_max_number,
        };

        await StorageService.saveAstralMaps(data.astral_maps);
        await StorageService.setExtraMapsMaxNumber(userData.extra_maps_max_number);

        return {
          success: true,
          data: {
            userData: data
          }
        };
      }
      
      return {
        success: false,
        error: 'Falha ao atualizar dados do usuário'
      };
      
    } catch (error) {
      console.error('Erro ao verificar dados do usuário (users/me)', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default UserDataRefreshService; 