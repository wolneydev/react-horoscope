import React, { useEffect, useState, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Modal,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import api from '../services/api';
import StorageService from '../store/store';

const BASE_IMAGE_URL = 'https://api.astralmatch.life/storage/';

const UserListScreen = () => {
  const navigation = useNavigation();

  const [compatibilidades, setCompatibilidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainUserPhoto, setMainUserPhoto] = useState(null);
  const [mainUserName, setMainUserName] = useState(null);
  const [mainExpanded, setMainExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [instagramModalVisible, setInstagramModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Social',
      headerStyle: { backgroundColor: '#141527' },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    fetchData();
  }, []);

  // Busca os dados no endpoint "astralmapusers"
  const fetchData = async () => {
    try {
      const token = await StorageService.getAccessToken();
      const response = await api.get('astralmapusers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        if (response.data.data.compatibilidades) {
          setCompatibilidades(response.data.data.compatibilidades);
          if (!response.data.data.main_user_profile_photo && response.data.data.compatibilidades.length > 0) {
            setMainUserPhoto(response.data.data.compatibilidades[0].main_user_profile_photo);
          } else {
            setMainUserPhoto(response.data.data.main_user_profile_photo);
          }
        }
        if (response.data.data.compatibilidades[0].main_user_name) {
          setMainUserName(response.data.data.compatibilidades[0].main_user_name);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandItem = (index) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleMainExpand = () => {
    setMainExpanded(!mainExpanded);
  };

  const handleOpenInstagramModal = (user) => {
    setSelectedUser(user);
    setInstagramModalVisible(true);
  };

  const handleCloseInstagramModal = () => {
    setInstagramModalVisible(false);
    setSelectedUser(null);
  };

  const getCompatibilityColor = (value) => {
    if (!value) return '#bbb';
    if (value < 70) return 'red';
    if (value < 80) return 'yellow';
    return 'green';
  };

  // Renderiza cada item da lista de usuários
  const renderUserItem = ({ item, index }) => {
    const isExpanded = !!expandedItems[index];
    const compatibilidadeFormatada = item.compatibilidade_media?.toFixed(2);

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.chartCard} onPress={() => toggleExpandItem(index)}>
          <View style={styles.chartIconContainer}>
            {item.user_photo_url ? (
              <Image 
                source={{ uri: `${BASE_IMAGE_URL}${item.user_photo_url}` }} 
                style={styles.userPhoto} 
              />
            ) : (
              <Icon name="person" size={32} color="#6D44FF" />
            )}
          </View>
          <View style={styles.chartInfo}>
            <Text style={styles.chartName}>{item.nome_usuario}</Text>
            <Text style={[styles.chartDetails, { color: getCompatibilityColor(item.compatibilidade_media) }]}>
              Conexão Astral: {compatibilidadeFormatada}%
            </Text>
          </View>
          <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color="#6D44FF" />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.expandedContainer}>
            <View style={styles.expandedImageWrapper}>
              {item.user_photo_url ? (
                <Image 
                  source={{ uri: `${BASE_IMAGE_URL}${item.user_photo_url}` }} 
                  style={styles.expandedUserPhoto} 
                />
              ) : (
                <Icon name="person" size={48} color="#6D44FF" />
              )}
            </View>
            <View style={styles.expandedTextContainer}>
              <Text style={styles.expandedText}>
                Detalhes adicionais sobre {item.nome_usuario}
              </Text>
            </View>
          </View>
        )}
        <TouchableOpacity style={styles.instagramButton} onPress={() => handleOpenInstagramModal(item)}>
          <Icon name="camera-alt" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* InfoCard do usuário logado */}
        <TouchableOpacity style={styles.infoCard} onPress={toggleMainExpand}>
          <View style={styles.infoCardHeader}>
            {mainUserPhoto ? (
              <Image 
                source={{ uri: `${BASE_IMAGE_URL}${mainUserPhoto}` }} 
                style={styles.infoCardPhoto} 
              />
            ) : (
              <Icon name="person" size={60} color="#fff" />
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.infoCardTitle}>{mainUserName || 'Social'}</Text>
            </View>
            <TouchableOpacity style={styles.changePhotoButton} onPress={() => navigation.navigate('PhotoPicker')}>
              <Icon name="edit" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {mainExpanded && (
            <View style={styles.mainExpandedContainer}>
              <Text style={styles.expandedText}>
                Detalhes adicionais do usuário principal.
              </Text>
            </View>
          )}
          <Text style={styles.infoCardDescription}>
            Explicação da conexão astral: Combinação em relação à compatibilidade de signos do mapa astral, mas não é uma Combinação da Sinastria, que é uma análise mais profunda e complexa.
          </Text>
        </TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator color="#6D44FF" size="large" />
        ) : (
          <FlatList
            data={compatibilidades}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={styles.chartsList}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma compatibilidade encontrada</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
        <Modal 
          visible={instagramModalVisible} 
          transparent 
          animationType="fade" 
          onRequestClose={handleCloseInstagramModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Solicitação de Instagram</Text>
              <Text style={styles.modalText}>
                Deseja solicitar o Instagram de {selectedUser?.nome_usuario}?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, { marginRight: 10 }]} onPress={handleCloseInstagramModal}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleCloseInstagramModal}>
                  <Text style={styles.modalButtonText}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default UserListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  /* InfoCard do usuário logado (reduzido pela metade) */
  infoCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.15)',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoCardPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCardDescription: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 5,
  },
  changePhotoButton: {
    padding: 6,
    backgroundColor: '#6D44FF',
    borderRadius: 8,
    marginLeft: 8,
  },
  chartsList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  /* Card dos usuários */
  cardContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  chartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  chartIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 10,
    borderRadius: 30,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  chartInfo: {
    flex: 1,
  },
  chartName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartDetails: {
    fontSize: 16,
    marginTop: 4,
  },
  /* Área expandida dos cards dos usuários */
  expandedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6D44FF',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  expandedImageWrapper: {
    borderWidth: 1,
    borderColor: '#6D44FF',
    borderRadius: 10,
    padding: 5,
  },
  expandedUserPhoto: {
    width: 200,
    height: 200,
    borderRadius: 15,
  },
  expandedTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  expandedText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  /* Área expandida do card do usuário principal (apenas texto) */
  mainExpandedContainer: {
    borderWidth: 1,
    borderColor: '#6D44FF',
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  /* Botão de Instagram */
  instagramButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    backgroundColor: '#6D44FF',
    padding: 10,
    borderRadius: 20,
  },
  emptyText: {
    color: '#7A708E',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#141527',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  modalTitle: {
    fontSize: 22,
    color: '#FFD700',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    backgroundColor: 'rgba(109, 68, 255, 0.3)',
    borderColor: 'rgba(109, 68, 255, 0.6)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
