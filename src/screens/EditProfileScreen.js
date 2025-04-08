import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { TextInputMask } from 'react-native-masked-text'; // <--- biblioteca de máscara
import PhotoPicker from '../Components/PhotoPicker';
import MessageModal from '../Components/MessageModal';
import api from '../services/api';
import StorageService from '../store/store';
import AnimatedStars from '../Components/animation/AnimatedStars';
import LoadingOverlay from '../Components/LoadingOverlay';
import EmailVerificationGuard from '../Components/emailVerification/EmailVerificationGuard';

export default function EditProfileScreen() {
  const navigation = useNavigation();

  // ----------------------------
  // Estados para foto do perfil
  // ----------------------------
  const [photo, setPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ----------------------------
  // Estados de contatos
  // ----------------------------
  const [contactTypes, setContactTypes] = useState([]);
  const [existingContacts, setExistingContacts] = useState([]);
  const [userContacts, setUserContacts] = useState({});

  // ----------------------------
  // Estados para modal de mensagem
  // ----------------------------
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [msgModalType, setMsgModalType] = useState('info');
  const [msgModalText, setMsgModalText] = useState('');
  
  // ----------------------------
  // Estados para dados do usuário
  // ----------------------------
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando dados do usuário...');
  
  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  // ----------------------------
  // Exemplo de dados fixos do perfil
  // ----------------------------
  const userProfile = {
    name: 'Maria Clara Silva',
    birthDate: '25/08/1995',
    zodiacSign: 'Virgem',
    contactMessage: 'Esses são contatos que você pode escolher compartilhar com os usuários que te solicitarem, caso aprove suas solicitações em seu menu de notificações 😊',
  };

  // Na montagem do componente, buscamos:
  // 1) A foto de perfil do usuário
  // 2) Os contatos do usuário
  useEffect(() => {

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        console.log('fetchUserData');
        const savedUserData = await StorageService.getUserData();
        console.log('savedUserData', savedUserData);
        setUserData(savedUserData);
        console.log('userData', userData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
    fetchProfilePhoto();
    fetchContactsData();
  }, []);

  // -------------------------------------
  // Função para exibir mensagens (modal)
  // -------------------------------------
  const showMessage = (text, type) => {
    setMsgModalText(text);
    setMsgModalType(type);
    setMsgModalVisible(true);
  };

  // -------------------------------------
  // Busca a foto de perfil do usuário
  // -------------------------------------
  const fetchProfilePhoto = async () => {
    try {
      const token = await StorageService.getAccessToken();
      const response = await api.get('getusersphoto/profiles', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Supondo que a API está retornando algo como "\"https://url...\""
      let photoUrl = response.data;
      if (typeof photoUrl === 'string') {
        // Remove aspas duplas no início e fim da string
        photoUrl = photoUrl.replace(/^"|"$/g, '');
      }
  
      if (photoUrl) {
        setPhoto({ uri: photoUrl });
      }
    } catch (error) {
      console.log('Erro ao buscar foto de perfil:', error);
      showMessage('Não foi possível carregar a foto de perfil.', 'danger');
    }
  };

  // -------------------------------------
  // Busca os contatos do usuário
  // -------------------------------------
  const fetchContactsData = async () => {
    try {
      const token = await StorageService.getAccessToken();
      console.log('token', token);
      const response = await api.get('getcontacstsuser', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { contact_types, contacts } = response.data.data.data;

      setContactTypes(contact_types || []);
      setExistingContacts(contacts || []);

      // Cria o mapeamento contact_type_id -> description
      const contactsObj = {};
      (contacts || []).forEach((c) => {
        contactsObj[c.contact_type_id] = c.description;
      });
      setUserContacts(contactsObj);

    } catch (error) {
      console.log('Erro ao buscar contatos:', error);
      showMessage('Não foi possível buscar os contatos.', 'danger');
    }
  };

  // -------------------------------------
  // Atualiza valor do contato digitado
  // -------------------------------------
  const handleChangeContact = (contactTypeId, value) => {
    setUserContacts((prev) => ({
      ...prev,
      [contactTypeId]: value,
    }));
  };

  // -------------------------------------
  // Salvar (insert/update) contatos
  // -------------------------------------
  const handleSave = async () => {
    try {
      const token = await StorageService.getAccessToken();

      for (const type of contactTypes) {
        const typedDescription = userContacts[type.id] || '';
        const existing = existingContacts.find((c) => c.contact_type_id === type.id);

        if (existing) {
          // UPDATE
          const itemToUpdate = {
            contact_id: existing.contact_id,
            contact_type_id: existing.contact_type_id,
            description: typedDescription,
          };
          await api.put('contactsuser', itemToUpdate, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          // INSERT (se houver algo digitado)
          if (typedDescription) {
            const itemToCreate = [
              {
                contact_type_id: type.id,
                description: typedDescription,
              },
            ];
            await api.post('contactsuser', itemToCreate, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }
        }
      }

      showMessage('Contatos salvos com sucesso!', 'success');
      fetchContactsData();
    } catch (error) {
      console.log('Erro ao salvar contatos:', error);
      showMessage('Erro ao salvar contatos.', 'danger');
    }
  };

  // -------------------------------------
  // Excluir um contato existente
  // -------------------------------------
  const handleDeleteContact = async (contact) => {
    try {
      const token = await StorageService.getAccessToken();
      const payload = {
        contact_id: contact.contact_id,
        contact_type_id: contact.contact_type_id,
        description: contact.description,
      };

      await api.delete('contactsuser', {
        headers: { Authorization: `Bearer ${token}` },
        data: payload,
      });

      showMessage('Contato excluído com sucesso!', 'success');
      fetchContactsData();
    } catch (error) {
      console.log('Erro ao excluir contato:', error);
      showMessage('Não foi possível excluir o contato.', 'danger');
    }
  };

  // -------------------------------------
  // Renderiza o campo de input, com máscara (WhatsApp/Telegram) ou texto normal
  // -------------------------------------
  const renderContactInput = (type) => {
    const value = userContacts[type.id] || '';
    const existing = existingContacts.find((c) => c.contact_type_id === type.id);

    // Se for whatsapp(1) ou telegram(2), aplica mascara +55(99)9999-99999
    if (type.id === 1 || type.id === 2) {
      return (
        <TextInputMask
          type={'custom'}
          options={{
            mask: '+55(99)9999-99999',
          }}
          value={value}
          onChangeText={(maskedValue) => handleChangeContact(type.id, maskedValue)}
          placeholder={type.name}
          placeholderTextColor="#FFFFFF"
          style={[styles.input, { marginRight: existing ? 8 : 0 }]}
        />
      );
    } else {
      // input normal
      return (
        <TextInput
          style={[styles.input, { marginRight: existing ? 8 : 0 }]}
          placeholder={type.name}
          placeholderTextColor="#FFFFFF"
          value={value}
          onChangeText={(val) => handleChangeContact(type.id, val)}
        />
      );
    }
  };

  return (
    <EmailVerificationGuard>
      <ScrollView style={styles.container}>
        {memoStars}
        {isLoading && <LoadingOverlay message={loadingMessage} />}

        <View style={styles.content}>
          {/* Card com infos do usuário (nome, data de nascimento, signo) */}
          <View style={styles.userCard}>
            {/* Avatar + Botão de foto */}
            <View style={styles.avatarContainer}>
              {photo && photo.uri ? (
                // Se já tem URL da foto, mostra a <Image>
                <Image source={{ uri: photo.uri }} style={styles.avatarImage} />
              ) : (
                // Caso não tenha foto, mostra o placeholder
                <View style={styles.avatarPlaceholder}>
                  <Icon name="user" size={40} color="#666" />
                </View>
              )}

              {/* Botão de editar foto (ícone de lápis) */}
              <TouchableOpacity
                style={styles.editPhotoButton}
                onPress={() => setModalVisible(true)}
              >
                <Icon
                  name="edit-2"
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Infos do usuário (somente leitura) */}
            {userData ? (
              <>
                <Text style={styles.userName}>{userData.name}</Text>

                <View style={styles.infoRow}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Data de nascimento</Text>
                    <Text style={styles.readOnly}>{userData.birth_date}</Text>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Signo</Text>
                    <Text style={styles.readOnly}>{userData.email_verified_at}</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.userName}>Carregando dados...</Text>
            )}
          </View>

          {/* Seção de contatos */}
          <Text style={styles.sectionTitle}>Contatos</Text>

          {contactTypes.map((type) => {
            const existing = existingContacts.find((c) => c.contact_type_id === type.id);
            return (
              <View key={type.id} style={styles.contactRow}>
                <Icon
                  name={defineIconName(type.name)}
                  size={20}
                  color={defineIconColor(type.name)}
                  style={styles.icon}
                />
                {renderContactInput(type)}

                {/* Ícone de lixeira se já existe */}
                {existing && (
                  <TouchableOpacity onPress={() => handleDeleteContact(existing)}>
                    <Icon name="trash-2" size={20} color="#FF4747" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* Mensagem padrão */}
          <View style={styles.field}>
            <Text style={styles.label}>Você poderá selecionar um desses contatos para compartilhar no menu notificações</Text>
            <Text style={styles.readOnlyMessage}>{userProfile.contactMessage}</Text>
          </View>

          {/* Botão para Salvar */}
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar contatos</Text>
          </TouchableOpacity>
        </View>

        {/* Modal para escolher foto (PhotoPicker) */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <PhotoPicker
                photo={photo}
                setPhoto={(newPhoto) => {
                  setPhoto(newPhoto);
                  setModalVisible(false);
                }}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de mensagens (sucesso/erro) */}
        <MessageModal
          visible={msgModalVisible}
          onClose={() => setMsgModalVisible(false)}
          message={msgModalText}
          type={msgModalType}
        />
      </ScrollView>
    </EmailVerificationGuard>
  );
}

/** Define ícone baseado no nome do contato */
function defineIconName(contactName) {
  switch (contactName.toLowerCase()) {
    case 'whatsapp':
      return 'phone';
    case 'telegram':
      return 'send';
    case 'instagram':
      return 'instagram';
    case 'snapchat':
      return 'message-square';
    default:
      return 'smartphone';
  }
}

/** Define cor do ícone baseado no nome do contato (opcional) */
function defineIconColor(contactName) {
  switch (contactName.toLowerCase()) {
    case 'whatsapp':
      return '#25D366';
    case 'telegram':
      return '#0088cc';
    case 'instagram':
      return '#C13584';
    case 'snapchat':
      return '#FFFC00';
    default:
      return '#fff';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  userCard: {
    borderWidth: 1,
    borderColor: '#6D44FF', // borda roxa
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 15,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6D44FF',
    padding: 6,
    borderRadius: 20,
  },
  userName: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  field: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  readOnly: {
    color: '#bbb',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#6D44FF',
    color: '#fff',
    paddingVertical: 5,
  },
  readOnlyMessage: {
    color: '#bbb',
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#6D44FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#141527',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalButton: {
    marginTop: 15,
    backgroundColor: '#6D44FF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
