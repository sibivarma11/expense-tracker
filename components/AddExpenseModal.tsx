import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  amount: string;
  setAmount: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  isDark: boolean;
}

export default function AddExpenseModal({
  visible,
  onClose,
  onSave,
  amount,
  setAmount,
  category,
  setCategory,
  description,
  setDescription,
  isDark,
}: AddExpenseModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.popup, isDark && styles.popupDark]}>
          <Text style={[styles.popupTitle, isDark && styles.popupTitleDark]}>Add New Expense</Text>
          
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Amount"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Category (e.g., Food, Transport, Shopping, Bills)"
            placeholderTextColor={isDark ? "#666" : "#999"}
            value={category}
            onChangeText={setCategory}
          />
          
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Description (optional)"
            placeholderTextColor={isDark ? "#666" : "#999"}
            value={description}
            onChangeText={setDescription}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, styles.cancelButton, isDark && styles.cancelButtonDark]}
            >
              <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onSave}
              style={[styles.modalButton, styles.saveButton]}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "85%",
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  popupDark: {
    backgroundColor: "#1c1c1e",
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  popupTitleDark: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  inputDark: {
    borderColor: "#444",
    backgroundColor: "#2c2c2e",
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonDark: {
    backgroundColor: "#2c2c2e",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  cancelButtonTextDark: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#1e7cf8",
  },
  saveButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});