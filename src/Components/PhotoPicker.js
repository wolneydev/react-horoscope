import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import StorageService from '../store/store';
import api from '../services/api';
import CustomButton from './CustomButton';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';
import MessageModal from './MessageModal';

export default function PhotoPicker({ onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        setMessageModal({
          visible: true,
          title: 'Atenção',
          message: 'É necessário permitir acesso à galeria para enviar fotos.',
          type: 'warning'
        });
      }

      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        setMessageModal({
          visible: true,
          title: 'Atenção',
          message: 'É necessário permitir acesso à câmera para tirar fotos.',
          type: 'warning'
        });
      }
    })();
  }, []);

  // Função para redimensionar e comprimir a imagem
  const processImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Redimensiona para largura máxima de 800px
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Erro ao manipular a imagem:', error);
      return uri;
    }
  };

  /**
   * Abre a câmera para tirar foto
   */
  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // para versões anteriores à 14
        quality: 1,
      });

      if (!result.canceled) {
        setIsProcessing(true);
        const processedUri = await processImage(result.assets[0].uri);
        setSelectedImage(processedUri);
        setIsProcessing(false);
      }
    } catch (error) {
      console.log('Erro ao abrir câmera:', error);
    }
  };

  /**
   * Abre a galeria para escolher imagem
   */
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setIsProcessing(true);
        const processedUri = await processImage(result.assets[0].uri);
        setSelectedImage(processedUri);
        setIsProcessing(false);
      }
    } catch (error) {
      console.log('Erro ao acessar galeria:', error);
    }
  };

  /**
   * Limpa a imagem selecionada
   */
  const handleClearImage = () => {
    setSelectedImage(null);
  };

  /**
   * Envia a imagem como 'imagem' para o endpoint com Bearer Token
   */
  const handleUploadImage = async () => {
    if (!selectedImage) {
      setMessageModal({
        visible: true,
        title: 'Atenção',
        message: 'Nenhuma imagem selecionada!',
        type: 'warning'
      });
      return;
    }

    try {
      const token = await StorageService.getAccessToken();

      const formData = new FormData();
      formData.append('imagem', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'minha_foto.jpg',
      });
      
      const response = await api.post('users/photos/upload-profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const userData = await StorageService.getUserData();
        userData.has_profile_photo = true;
        userData.profile_photo_url = response.data.data;
        await StorageService.saveUserData(userData);

        setMessageModal({
          visible: true,
          title: 'Sucesso',
          message: 'Imagem de perfil atualizada com sucesso!',
          type: 'success',
          onClose: () => {
            setMessageModal(prev => ({ ...prev, visible: false }));
            onClose();
          }
        });
      } else {
        setMessageModal({
          visible: true,
          title: 'Erro',
          message: 'Falha ao enviar a imagem.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro no envio da imagem:', error);
      console.error('Erro no envio da imagem:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        responseStatus: error.response?.status,
        responseHeaders: error.response?.headers
      });
      setMessageModal({
        visible: true,
        title: 'Erro',
        message: 'Ocorreu um erro ao enviar a imagem.',
        type: 'error'
      });
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Selecione uma foto sua da galeria ou tire uma com a câmera!</Text>
        
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Tirar foto"
            onPress={handleTakePhoto}
            icon="camera"
          />
          <CustomButton
            title="Escolher da galeria"
            onPress={handlePickImage}
            icon="image"
          />
        </View>

        {isProcessing && (
          <ActivityIndicator 
            size="large" 
            color={COLORS.PRIMARY} 
            style={styles.loader} 
          />
        )}
        
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />            
            </View>
            <TouchableOpacity 
              style={styles.successButton}
              onPress={handleUploadImage}
            >
              <Text style={styles.successButtonText}>Selecionar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <MessageModal
        visible={messageModal.visible}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        onClose={messageModal.onClose || (() => setMessageModal(prev => ({ ...prev, visible: false })))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MEDIUM,
  },
  title: {
    fontSize: FONTS.SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.MEDIUM,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    resizeMode: 'cover',
  },
  loader: {
    marginVertical: SPACING.MEDIUM,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    marginBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND_DARK,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  placeholderText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.MEDIUM,
    marginTop: SPACING.SMALL,
  },
  selectedImageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  successButton: {    
    backgroundColor: COLORS.SUCCESS,
    padding: SPACING.MEDIUM,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    marginTop: SPACING.LARGE,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
});
