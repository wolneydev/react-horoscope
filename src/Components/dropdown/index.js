import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from "react-native";

const Dropdown = ({ data }) => {
  const [selectedValue, setSelectedValue] = useState("Nada selecionado");
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (item) => {
    setSelectedValue(item.name);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dropdown}>
        <Text style={[styles.selectedText, selectedValue === "Nada selecionado" && styles.placeholderText]}>
          {selectedValue}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={[{ name: "Nada selecionado" }, ...data]}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)} style={styles.option}>
                  <Text style={styles.optionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "left",
    alignItems: "left",
    marginVertical: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 19,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedText: {
    color: "gray",
    fontSize: 16,
  },
  placeholderText: {
    color: "#B0B0B0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 250,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    maxHeight: 300,
  },
  option: {
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionText: {
    fontSize: 16,
    color: "gray",
  },
});

export default Dropdown;
