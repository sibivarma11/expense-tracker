import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  isDark: boolean;
}

export default function ExpenseList({ expenses, onDeleteExpense, isDark }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <View style={styles.list}>
        <Text style={[styles.noExpenses, isDark && styles.noExpensesDark]}>
          No expenses for this day
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {expenses.map(exp => (
        <View key={exp.id} style={[styles.item, isDark && styles.itemDark]}>
          <View style={styles.info}>
            <Text style={[styles.category, isDark && styles.categoryDark]}>
              {exp.category}
            </Text>
            {exp.description && (
              <Text style={[styles.description, isDark && styles.descriptionDark]}>
                {exp.description}
              </Text>
            )}
            <Text style={[styles.time, isDark && styles.timeDark]}>
              {new Date(exp.date).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.amount}>₹{exp.amount.toFixed(2)}</Text>
            <TouchableOpacity 
              onPress={() => onDeleteExpense(exp.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: "90%",
  },
  noExpenses: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 30,
  },
  noExpensesDark: {
    color: "#666",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemDark: {
    backgroundColor: "#1c1c1e",
  },
  info: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryDark: {
    color: "#fff",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  descriptionDark: {
    color: "#999",
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  timeDark: {
    color: "#666",
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e7cf8",
  },
  deleteButton: {
    marginTop: 5,
  },
  deleteText: {
    fontSize: 24,
    color: "#ff4444",
    fontWeight: "bold",
  },
});