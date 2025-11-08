import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Moves modal up
        style={styles.modalOverlay}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
          keyboardShouldPersistTaps="handled"
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

            {/* Payment Method Dropdown */}
            <View style={[styles.pickerWrapper, isDark && styles.pickerWrapperDark]}>
              <Picker
                selectedValue={paymentMethod}
                onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                dropdownIconColor={isDark ? "#fff" : "#000"}
                style={[styles.picker, isDark && styles.pickerDark]}
              >
                <Picker.Item label="Select Payment Method" value="" />
                <Picker.Item label="Cash" value="Cash" />
                <Picker.Item label="UPI" value="UPI" />
                <Picker.Item label="Credit Card" value="Credit Card" />
                <Picker.Item label="Debit Card" value="Debit Card" />
                <Picker.Item label="Net Banking" value="Net Banking" />
                <Picker.Item label="Wallet" value="Wallet" />
              </Picker>
            </View>

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
        </ScrollView>
      </KeyboardAvoidingView>
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

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerWrapperDark: {
    borderColor: "#444",
    backgroundColor: "#2c2c2e",
  },
  picker: {
    height: 50,
    color: "#000",
  },
  pickerDark: {
    color: "#fff",
  },

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
