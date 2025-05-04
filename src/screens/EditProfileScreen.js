import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { TextInputMask } from 'react-native-masked-text'; // <--- biblioteca de máscara
import PhotoPicker from '../Components/PhotoPicker';
import MessageModal from '../Components/MessageModal';
import api from '../services/api';
import StorageService from '../store/store';
import AnimatedStars from '../Components/animation/AnimatedStars';
import LoadingOverlay from '../Components/LoadingOverlay';
import EmailVerificationGuard from '../Components/emailVerification/EmailVerificationGuard';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';
import { formatNumber } from '../utils/helpers';
import CustomButton from '../Components/CustomButton';

const EditProfileScreen = () => {
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
  const [hasProfilePhoto, setHasProfilePhoto] = useState(false);
  const [hasAnyContact, setHasAnyContact] = useState(false);

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

  // Adicione o estado de expansão
  const [isExpanded, setIsExpanded] = useState(false);

  // Adicione o estado
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  // Adicione o estado logo após a declaração do componente
  const [showInfoPopup, setShowInfoPopup] = useState(true);

  // No topo do arquivo, adicione:
  const profileValidation = useMemo(() => {

    return {
      isValid: hasProfilePhoto && hasAnyContact,
      messages: {
        photo: !hasProfilePhoto ? 'Adicione uma foto ao seu perfil' : null,
        contacts: !hasAnyContact ? 'Adicione pelo menos um contato' : null
      }
    };
  }, [hasProfilePhoto, hasAnyContact]);

  // Na montagem do componente, buscamos:
  // 1) A foto de perfil do usuário
  // 2) Os contatos do usuário
  useEffect(() => {
    setShowInfoPopup(true);
    fetchUserData();
    // busca os contatos do usuário
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
  // Busca os dados do usuário
  // -------------------------------------
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const savedUserData = await StorageService.getUserData();

      const token = await StorageService.getAccessToken();
      console.log('token', token);

      console.log('savedUserData', savedUserData);
      if (savedUserData.has_profile_photo) {
        setPhoto({ uri: savedUserData.profile_photo_url });
        setHasProfilePhoto(true);
      } else {
        setHasProfilePhoto(false);
      }
      
      setUserData(savedUserData);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------
  // Busca os contatos do usuário
  // -------------------------------------
  const fetchContactsData = async () => {
    try {
      const token = await StorageService.getAccessToken();
      console.log('token', token);
      const response = await api.get('users/contacts/', {
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
      console.log('contactsObj', contactsObj);
      console.log('contactsObj.length', Object.keys(contactsObj).length);

      setHasAnyContact(Object.keys(contactsObj).length > 0);
      console.log('hasAnyContact', hasAnyContact);

    } catch (error) {
      // Log mais detalhado do erro
      console.log('Erro completo:', error);
      console.log('Mensagem de erro:', error.message);
      console.log('Stack trace:', error.stack);
      
      // Se houver resposta da API
      if (error.response) {
        console.log('Status do erro:', error.response.status);
        console.log('Dados do erro:', error.response.data);
        console.log('Headers do erro:', error.response.headers);
      }
      
      // Se for erro de requisição
      if (error.request) {
        console.log('Erro na requisição:', error.request);
      }

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
          console.log('itemToUpdate', itemToUpdate);
          await api.put('users/contacts/contact', itemToUpdate, {
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
            console.log('itemToCreate', itemToCreate);
            await api.post('users/contacts/contact', itemToCreate, {
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

      console.log('payload', payload);
      await api.delete('users/contacts/contact', {
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

    const placeholderText = `Adicione seu ${type.name}`;
    const inputStyle = [
      styles.input,
      { marginRight: existing ? 8 : 0 },
      !value && styles.inputEmpty
    ];

    // Se for whatsapp(1) ou telegram(2), aplica mascara +55(99)9999-99999
    if (type.id === 1 || type.id === 2) {
      return (
        <View style={styles.inputWrapper}>
          <TextInputMask
            type={'custom'}
            options={{
              mask: '+55 (99) 99999-9999',
            }}
            value={value}
            onChangeText={(maskedValue) => handleChangeContact(type.id, maskedValue)}
            placeholder={placeholderText}
            placeholderTextColor={COLORS.TEXT_TERTIARY}
            style={inputStyle}
          />
          {!value && (
            <View style={styles.emptyInputHint}>
              <Icon name="plus" size={16} color={COLORS.TEXT_TERTIARY} />
              <Text style={styles.emptyInputText}>Adicionar</Text>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.inputWrapper}>
          <TextInput
            style={inputStyle}
            placeholder={placeholderText}
            placeholderTextColor={COLORS.TEXT_TERTIARY}
            value={value}
            onChangeText={(val) => handleChangeContact(type.id, val)}
          />
          {!value && (
            <View style={styles.emptyInputHint}>
              <Icon name="plus" size={16} color={COLORS.TEXT_TERTIARY} />
              <Text style={styles.emptyInputText}>Adicionar</Text>
            </View>
          )}
        </View>
      );
    }
  };

  const handleCloseModal = async () => {
    setModalVisible(false);
    
    // Atualiza a foto forçando o refresh da URL
    const userData = await StorageService.getUserData();
    if (userData?.profile_photo_url) {
      // Adiciona um query param para forçar o refresh
      const refreshedUrl = userData.profile_photo_url + '?t=' + Date.now();
      setPhoto({ uri: refreshedUrl });
    }
  };

  return (
    <EmailVerificationGuard>
      <View style={styles.containerWithButton}>
        <ScrollView style={styles.container}>
          {memoStars}
          {isLoading && <LoadingOverlay message={loadingMessage} />}

          <View style={styles.content}>
            
            {/* Card do Perfil */}
            <TouchableOpacity 
              style={styles.userCard}
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.userCardHeader}>
                <View style={styles.avatarAndInfo}>
                  <View style={styles.avatarContainer}>
                    {photo && photo.uri ? (
                      <Image source={{ uri: photo.uri }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Icon name="user" size={40} color={COLORS.TEXT_TERTIARY} />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.editPhotoButton}
                      onPress={() => setModalVisible(true)}
                    >
                      <Icon name="edit" size={16} color={COLORS.TEXT_PRIMARY} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.userName}>{userData?.name || 'Seu Nome'}</Text>
                    <Text style={styles.userSubtitle}>Ver detalhes do perfil</Text>
                  </View>
                </View>
                <Icon 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color={COLORS.PRIMARY} 
                />
              </View>

              {isExpanded && (
                <View style={styles.userCardContent}>
                  {[
                    { label: 'Nome', value: userData?.name },
                    { label: 'Signo', value: userData?.sign },
                    { label: 'Nascimento', value: userData?.birthData.day + '/' + userData?.birthData.month + '/' + userData?.birthData.year + ' às ' + formatNumber(userData?.birthData.hour) + ':' + formatNumber(userData?.birthData.minute) },
                    { label: 'Cidade natal', value: userData?.birthData.city },
                  ].map((item, index) => (
                    <View key={index} style={styles.attributeRow}>
                      <Text style={styles.attributeLabel}>{item.label}</Text>
                      <Text style={styles.attributeValue}>{item.value || '-'}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.warningContainer}>
              {!profileValidation.isValid ? (
                <View style={[styles.warningCard, styles.warningCardError]}>
                  <View style={styles.warningIconContainer}>
                    <Icon name="warning" size={24} color={COLORS.WARNING} />
                  </View>
                  <View style={styles.warningContent}>
                    {profileValidation.messages.photo && (
                      <View style={styles.warningItem}>
                        <Text style={styles.warningCardDescription}>
                          {profileValidation.messages.photo}
                        </Text>
                      </View>
                    )}
                    {profileValidation.messages.contacts && (
                      <View style={styles.warningItem}>
                        <Text style={styles.warningCardDescription}>
                          {profileValidation.messages.contacts}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View style={[styles.warningCard, styles.warningCardSuccess]}>
                  <View style={styles.warningIconContainer}>
                    <Icon name="check-circle" size={24} color={COLORS.SUCCESS} />
                  </View>
                  <View style={styles.warningContent}>
                    <Text style={styles.warningCardTitle}>Perfil completo!</Text>
                    <Text style={styles.warningCardDescription}>
                      Seu perfil está pronto para receber conexões
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Seção de Contatos */}
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Contatos</Text>
                <TouchableOpacity 
                  onPress={() => setShowInfoPopup(true)}
                  style={styles.infoButton}
                >
                  <Icon name="info" size={20} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>

              {/* Lista de contatos */}
              {contactTypes.map((type) => {
                const existing = existingContacts.find((c) => c.contact_type_id === type.id);
                return (
                  <View key={type.id} style={styles.contactRow}>
                    <View style={styles.contactTypeContainer}>
                      <Icon
                        name={defineIconName(type.name)}
                        size={24}
                        color={defineIconColor(type.name)}
                        style={styles.icon}
                      />
                      <Text style={styles.contactTypeName}>{type.name}</Text>
                    </View>
                    
                    <View style={styles.inputContainer}>
                      {renderContactInput(type)}
                      
                      {existing && (
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteContact(existing)}
                        >
                          <Icon name="trash" size={20} color={COLORS.ERROR} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.stickyButtonContainer}>
          <CustomButton
            title="Salvar contatos"
            onPress={handleSave}
            icon="save"
          />
        </View>
      </View>

      {/* Modal para escolher foto */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <PhotoPicker
              photo={photo}
              setPhoto={(newPhoto) => {
                setPhoto(newPhoto);
                setModalVisible(false);
              }}
              onClose={handleCloseModal}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleCloseModal()}
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

      <MessageModal
        visible={showInfoPopup}
        title="Como funciona o compartilhamento de contatos"
        type="info"
        onClose={() => setShowInfoPopup(false)}
        message=""
        extraContent={
          <View style={styles.popupContent}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemIconContainer}>
                <Icon name="check-circle" size={20} color={COLORS.SUCCESS} />
              </View>
              <Text style={styles.infoDescription}>
                Adicione pelo menos um contato para que outros usuários possam solicitar conexão com você
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoItemIconContainer}>
                <Icon name="warning" size={20} color={COLORS.WARNING} />
              </View>
              <Text style={styles.infoDescription}>
                Você receberá uma notificação quando alguém solicitar seus contatos
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoItemIconContainer}>
                <Icon name="share" size={20} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.infoDescription}>
                Escolha quais contatos deseja compartilhar com cada solicitação de conexão
              </Text>
            </View>
          </View>
        }
      />
    </EmailVerificationGuard>
  );
}; 

export default EditProfileScreen;

/** Define ícone baseado no nome do contato */
function defineIconName(contactName) {
  switch (contactName.toLowerCase()) {
    case 'whatsapp':
      return 'whatsapp';
    case 'telegram':
      return 'send';
    case 'instagram':
      return 'instagram';
    case 'snapchat':
      return 'snapchat-ghost';
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
    backgroundColor: COLORS.BACKGROUND,
  },
  containerWithButton: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    padding: SPACING.LARGE,
    paddingBottom: 80,
  },
  backButton: {
    marginBottom: 20,
  },
  userCard: {
    ...CARD_STYLES.DEFAULT,
    marginBottom: SPACING.TINY,
    overflow: 'hidden',
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
  },
  avatarAndInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.MEDIUM,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: COLORS.CARD_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  editPhotoButton: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: COLORS.PRIMARY,
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  userSubtitle: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
  },
  userCardContent: {
    marginTop: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.BORDER}20`,
  },
  attributeLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
    flex: 1,
  },
  attributeValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
    flex: 2,
    textAlign: 'right',
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginVertical: SPACING.TINY,
    marginTop: SPACING.LARGE,
  },
  contactRow: {
    ...CARD_STYLES.DEFAULT,
    marginVertical: SPACING.TINY,
    padding: SPACING.MEDIUM,
  },
  contactTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.TINY,
  },
  contactTypeName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  icon: {
    marginRight: SPACING.SMALL,
    width: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: 10,
    padding: SPACING.TINY,
    marginTop: SPACING.TINY,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: 8,
  },
  inputEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.BORDER_LIGHT,
    backgroundColor: 'transparent',
  },
  emptyInputHint: {
    position: 'absolute',
    right: SPACING.MEDIUM,
    top: '50%',
    transform: [{ translateY: -8 }],
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyInputText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
    marginLeft: SPACING.TINY,
  },
  deleteButton: {
    padding: SPACING.SMALL,
    marginLeft: SPACING.SMALL,
  },
  readOnlyMessage: {
    color: COLORS.TEXT_SECONDARY,
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: SPACING.MEDIUM,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    marginTop: SPACING.MEDIUM,
    fontSize: FONTS.SIZES.SMALL,
    lineHeight: FONTS.SIZES.LARGE,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MEDIUM,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    alignItems: 'center',
    marginVertical: SPACING.LARGE,
  },
  buttonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    width: '90%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  modalButton: {
    marginTop: SPACING.MEDIUM,
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MEDIUM,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  popupContent: {
    marginTop: SPACING.MEDIUM,
    gap: SPACING.MEDIUM,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.BACKGROUND_DARK,
    padding: SPACING.TINY,
    borderRadius: 8,
  },
  infoItemIconContainer: {
    padding: SPACING.TINY,
    marginRight: SPACING.SMALL,
  },
  infoDescription: {
    flex: 1,
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
    lineHeight: FONTS.SIZES.LARGE * 1.4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.LARGE,
    opacity: 0.1,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.TINY,
    paddingHorizontal: SPACING.SMALL,
  },
  infoButton: {
    marginLeft: SPACING.SMALL,
    padding: SPACING.TINY,
    backgroundColor: `${COLORS.PRIMARY}20`,
    borderRadius: 20,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.BORDER}20`,
  },
  warningContainer: {
    marginTop: SPACING.TINY,
    marginBottom: SPACING.MEDIUM,
  },
  warningCard: {
    flexDirection: 'row',
    padding: SPACING.MEDIUM,
    borderRadius: 12,
    alignItems: 'center',
  },
  warningCardError: {
    backgroundColor: `${COLORS.WARNING}15`,
    borderWidth: 1,
    borderColor: `${COLORS.WARNING}30`,
  },
  warningCardSuccess: {
    backgroundColor: `${COLORS.SUCCESS}15`,
    borderWidth: 1,
    borderColor: `${COLORS.SUCCESS}30`,
  },
  warningIconContainer: {
    marginRight: SPACING.MEDIUM,
  },
  warningContent: {
    flex: 1,
  },
  warningCardTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.TINY,
  },
  warningCardDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
    marginLeft: SPACING.TINY,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.TINY,
  },
});
