import { Text, StyleSheet, TouchableOpacity } from "react-native";

interface AddButtonProps {
  onPress: () => void;
  disabled: boolean;
  isToday: boolean;
}

export default function AddButton({ onPress, disabled, isToday }: AddButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, !isToday && styles.disabledButton]}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, !isToday && styles.disabledButtonText]}>
        + Add Expense
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: [{ translateX: -75 }],
    backgroundColor: "#1e7cf8",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#999",
  },
});