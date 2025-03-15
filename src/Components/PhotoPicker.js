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

export default function PhotoPicker() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      // Pedir permissão para galeria
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Atenção', 'É necessário permitir acesso à galeria para enviar fotos.');
      }

      // Pedir permissão para câmera
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Atenção', 'É necessário permitir acesso à câmera para tirar fotos.');
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
      Alert.alert('Atenção', 'Nenhuma imagem selecionada!');
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
      
      const response = await api.post('usersphoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Sucesso', 'Imagem enviada com sucesso!');
      } else {
        Alert.alert('Erro', 'Falha ao enviar a imagem.');
        console.error('Resposta do servidor:', response.data);
      }
    } catch (error) {
      console.error('Erro no envio da imagem:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao enviar a imagem.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Selecione ou tire uma foto</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePickImage}>
          <Text style={styles.buttonText}>Galeria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>Câmera</Text>
        </TouchableOpacity>
      </View>

      {isProcessing && <ActivityIndicator size="large" color="#6D44FF" style={{ marginVertical: 10 }} />}
      
      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearImage}>
              <Text style={styles.clearButtonText}>Remover</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
              <Text style={styles.uploadButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#141527',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6D44FF',
    paddingVertical: 1,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: 15,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
  },
  clearButton: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
