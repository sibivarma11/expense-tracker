import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface DateSelectorProps {
  selectedDate: Date;
  onChangeDate: (days: number) => void;
  onGoToToday: () => void;
  isToday: boolean;
  isDark: boolean;
}

export default function DateSelector({ selectedDate, onChangeDate, onGoToToday, isToday, isDark }: DateSelectorProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <View style={[styles.selector, isDark && styles.selectorDark]}>
      <TouchableOpacity onPress={() => onChangeDate(-1)} style={styles.button}>
        <Text style={styles.buttonText}>←</Text>
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
          {formatDate(selectedDate)}
        </Text>
        {!isToday && (
          <TouchableOpacity onPress={onGoToToday}>
            <Text style={styles.todayButton}>Go to Today</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={() => onChangeDate(1)} style={styles.button}>
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectorDark: {
    backgroundColor: "#1c1c1e",
  },
  button: {
    padding: 10,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e7cf8",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  dateTextDark: {
    color: "#fff",
  },
  todayButton: {
    fontSize: 12,
    color: "#1e7cf8",
    marginTop: 4,
  },
});