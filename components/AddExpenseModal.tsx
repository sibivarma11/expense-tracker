import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  paymentMethod: string;
  setPaymentMethod: (value: string) => void;

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
  paymentMethod,
  setPaymentMethod,
  isDark,
}: AddExpenseModalProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const paymentOptions = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Wallet",
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={[styles.popup, isDark && styles.popupDark]}>
            <Text style={[styles.popupTitle, isDark && styles.popupTitleDark]}>
              Add New Expense
            </Text>

            {/* Amount */}
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Amount"
              placeholderTextColor={isDark ? "#666" : "#999"}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Category */}
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Category (e.g., Food, Transport)"
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={category}
              onChangeText={setCategory}
            />

            {/* Custom Dropdown */}
            <View style={[styles.dropdownWrapper, isDark && styles.dropdownWrapperDark]}>
              <TouchableOpacity
                style={[styles.dropdownButton, isDark && styles.dropdownButtonDark]}
                onPress={() => setDropdownVisible(true)}
              >
                <Text style={[styles.dropdownText, isDark && styles.dropdownTextDark]}>
                  {paymentMethod || "Select Payment Method"}
                </Text>
                <Ionicons
                  name={dropdownVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>

            {/* Dropdown Modal */}
            <Modal
              visible={dropdownVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setDropdownVisible(false)}
            >
              <TouchableOpacity
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPressOut={() => setDropdownVisible(false)}
              >
                <View style={[styles.dropdownList, isDark && styles.dropdownListDark]}>
                  <FlatList
                    data={paymentOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setPaymentMethod(item);
                          setDropdownVisible(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, isDark && styles.dropdownItemTextDark]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Description */}
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Description (optional)"
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={description}
              onChangeText={setDescription}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.modalButton, styles.cancelButton, isDark && styles.cancelButtonDark]}
              >
                <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSave}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  popup: {
    width: "90%",
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 5,
  },
  popupDark: {
    backgroundColor: "#1c1c1e",
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
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
    backgroundColor: "#2c2c2e",
    borderColor: "#444",
    color: "#fff",
  },

  // Dropdown
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  dropdownWrapperDark: {
    borderColor: "#444",
    backgroundColor: "#2c2c2e",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  dropdownButtonDark: {
    backgroundColor: "#2c2c2e",
  },
  dropdownText: {
    fontSize: 16,
    color: "#000",
  },
  dropdownTextDark: {
    color: "#fff",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownList: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 300,
    elevation: 5,
  },
  dropdownListDark: {
    backgroundColor: "#2c2c2e",
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  dropdownItemTextDark: {
    color: "#fff",
  },

  // Buttons
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
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
    color: "#666",
    fontWeight: "600",
  },
  cancelButtonTextDark: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#1e7cf8",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
