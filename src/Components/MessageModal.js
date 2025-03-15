import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const iconsMap = {
  info: 'info',
  warning: 'alert-triangle',
  danger: 'x-circle',
  success: 'check-circle',
};

const colorsMap = {
  info: '#1E90FF',    // azul
  warning: '#FFA500', // laranja
  danger: '#FF0000',  // vermelho
  success: '#32CD32', // verde
};

export default function MessageModal({ visible, onClose, message, type = 'info' }) {
  const iconName = iconsMap[type] || iconsMap.info;
  const borderColor = colorsMap[type] || colorsMap.info;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { borderColor }]}>
          <Icon name={iconName} size={24} color={borderColor} style={styles.icon} />
          <Text style={styles.textMessage}>{message}</Text>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.buttonClose, { backgroundColor: borderColor }]}
          >
            <Text style={styles.buttonCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff', // Fundo branco
    borderRadius: 10,
    borderWidth: 2, // Borda com a cor dinâmica
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 10,
  },
  textMessage: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
  },
  buttonClose: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 5,
  },
  buttonCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
