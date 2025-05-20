import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, FlatList } from 'react-native';
import CustomButton from '../Components/CustomButton';
import MessageModal from '../Components/MessageModal';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';
import StorageService from '../store/store';
import api from '../services/api';

export default function DiaryScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'info' });
  const [history, setHistory] = useState([]);

  // Buscar histórico ao abrir a tela
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await StorageService.getAccessToken();
      const response = await api.get('/diario', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHistory(response.data);
    } catch (error) {
      setModal({ visible: true, title: 'Erro', message: 'Erro ao buscar histórico do diário.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setModal({ visible: true, title: 'Atenção', message: 'Contea um pouco do seu dia!', type: 'warning' });
      return;
    }
    setLoading(true);
    setAiResponse('');
    try {
      // Envia para o backend
      const token = await StorageService.getAccessToken();
      const data = new URLSearchParams();
      data.append('message', message);

      const response = await api.post('/diario', data.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });

      const dataResponse = response.data?.data;
      console.log(dataResponse);
      setAiResponse(dataResponse?.resposta_ia || 'Não foi possível obter uma  resposta da IA.');

      // Atualiza histórico localmente (opcional: ou chame fetchHistory novamente)
      setHistory((prev) => [
        {
          id: dataResponse.id,
          mensagem_usuario: dataResponse.mensagem_usuario,
          resposta_ia: dataResponse.resposta_ia,
          created_at: dataResponse.created_at,
        },
        ...prev,
      ]);
      setMessage('');
    } catch (error) {
      console.log(error);
      //detalhando erro
      console.log(error.response.data);
      setModal({ visible: true, title: 'Erro', message: 'Erro ao enviar para a IA.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleString('pt-BR')}</Text>
      <Text style={styles.historyUserMsg}>{item.mensagem_usuario}</Text>
      <Text style={styles.historyIaTitle}>Resposta da IA:</Text>
      <Text style={styles.historyIaMsg}>{item.resposta_ia}</Text>
    </View>
  );

  // Cabeçalho do diário (input, botão, resposta da IA)
  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Text style={styles.title}>Diário do Dia</Text>
      <Text style={styles.subtitle}>Conte um pouco do seu dia (máx. 250 caracteres):</Text>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={t => t.length <= 250 && setMessage(t)}
        placeholder="Como foi seu dia?"
        placeholderTextColor={COLORS.TEXT_TERTIARY}
        multiline
        maxLength={250}
      />
      <Text style={styles.charCount}>{message.length}/250</Text>
      <CustomButton
        title="Enviar"
        onPress={handleSend}
        loading={loading}
        icon="send"
      />
      {aiResponse ? (
        <View style={styles.responseBox}>
          <Text style={styles.responseTitle}>Resposta da IA:</Text>
          <Text style={styles.responseText}>{aiResponse}</Text>
        </View>
      ) : null}
      <Text style={styles.historyTitle}>Histórico</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={history}
        keyExtractor={item => String(item.id)}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<Text style={styles.emptyHistory}>Nenhuma mensagem enviada ainda.</Text>}
        keyboardShouldPersistTaps="handled"
      />
      <MessageModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.LARGE,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: FONTS.SIZES.XLARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    minHeight: 100,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    color: COLORS.TEXT_TERTIARY,
    marginBottom: SPACING.LARGE,
    fontSize: FONTS.SIZES.SMALL,
  },
  responseBox: {
    marginTop: SPACING.LARGE,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    padding: SPACING.MEDIUM,
    width: '100%',
  },
  responseTitle: {
    color: COLORS.PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.SMALL,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  responseText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  historyTitle: {
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.SMALL,
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    alignSelf: 'flex-start',
  },
  historyItem: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  historyDate: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
    marginBottom: SPACING.TINY,
    textAlign: 'right',
  },
  historyUserMsg: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    marginBottom: SPACING.TINY,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
  },
  historyIaTitle: {
    color: COLORS.PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.TINY,
    fontSize: FONTS.SIZES.SMALL,
  },
  historyIaMsg: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  emptyHistory: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.MEDIUM,
    textAlign: 'center',
    marginTop: SPACING.LARGE,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: SPACING.LARGE,
  },
}); 