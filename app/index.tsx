import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import * as SQLite from 'expo-sqlite';
import AddExpenseModal from '../components/AddExpenseModal';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function Index() {
  const [isOpen, setIsOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Initialize SQLite database
  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    const db = await SQLite.openDatabaseAsync('expenses.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        amount REAL,
        category TEXT,
        description TEXT,
        date TEXT
      );
    `);
    loadExpenses();
  };

  const loadExpenses = async () => {
    const db = await SQLite.openDatabaseAsync('expenses.db');
    const result = await db.getAllAsync('SELECT * FROM expenses ORDER BY date DESC');
    setExpenses(result as Expense[]);
  };

  const addExpense = async () => {
    if (!amount || !category) {
      alert("Please fill in amount and category");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category: category.trim(),
      description: description.trim(),
      date: new Date().toISOString(),
    };

    const db = await SQLite.openDatabaseAsync('expenses.db');
    await db.runAsync(
      'INSERT INTO expenses (id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
      [newExpense.id, newExpense.amount, newExpense.category, newExpense.description, newExpense.date]
    );
    
    setExpenses([newExpense, ...expenses]);
    setAmount("");
    setCategory("");
    setDescription("");
    setIsOpen(false);
  };

  const deleteExpense = async (id: string) => {
    const db = await SQLite.openDatabaseAsync('expenses.db');
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  // Filter expenses by selected month and year
  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === selectedMonth && expDate.getFullYear() === selectedYear;
    });
  };

  // Group expenses by day
  const getExpensesByDay = () => {
    const filtered = getFilteredExpenses();
    const grouped: { [key: string]: Expense[] } = {};
    
    filtered.forEach(exp => {
      const date = new Date(exp.date);
      const dayKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(exp);
    });
    
    return grouped;
  };

  // Calculate totals for selected month
  const getTotalExpense = () => {
    return getFilteredExpenses().reduce((sum, exp) => sum + exp.amount, 0);
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    const filtered = getFilteredExpenses();
    const breakdown: { [key: string]: number } = {};
    
    filtered.forEach(exp => {
      if (!breakdown[exp.category]) {
        breakdown[exp.category] = 0;
      }
      breakdown[exp.category] += exp.amount;
    });
    
    return breakdown;
  };

  const expensesByDay = getExpensesByDay();
  const totalExpense = getTotalExpense();
  const categoryBreakdown = getCategoryBreakdown();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const changeMonth = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <View style={styles.expense}>
          <Text style={styles.title}>Total Expense</Text>
          <Text style={styles.amount}>₹{totalExpense.toFixed(2)}</Text>
          
          {Object.keys(categoryBreakdown).length > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>By Category:</Text>
              {Object.entries(categoryBreakdown).map(([cat, amt]) => (
                <View key={cat} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{cat}</Text>
                  <Text style={styles.categoryAmount}>₹{amt.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {months[selectedMonth]} {selectedYear}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Expenses by Day */}
        <View style={styles.expensesList}>
          {Object.keys(expensesByDay).length === 0 ? (
            <Text style={styles.noExpenses}>No expenses for this month</Text>
          ) : (
            Object.entries(expensesByDay).map(([day, dayExpenses]) => (
              <View key={day} style={styles.dayGroup}>
                <Text style={styles.dayHeader}>{day}</Text>
                {dayExpenses.map(exp => (
                  <View key={exp.id} style={styles.expenseItem}>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseCategory}>{exp.category}</Text>
                      {exp.description && (
                        <Text style={styles.expenseDescription}>{exp.description}</Text>
                      )}
                      <Text style={styles.expenseTime}>
                        {new Date(exp.date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <View style={styles.expenseRight}>
                      <Text style={styles.expenseAmount}>₹{exp.amount.toFixed(2)}</Text>
                      <TouchableOpacity 
                        onPress={() => deleteExpense(exp.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Expense Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Add Expense</Text>
      </TouchableOpacity>

      <AddExpenseModal
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={addExpense}
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        description={description}
        setDescription={setDescription}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 100,
  },
  expense: {
    width: "90%",
    padding: 20,
    backgroundColor: "#1e7cf8",
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
    marginTop: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  amount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },
  categorySection: {
    width: "100%",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  categoryName: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  monthSelector: {
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
  monthButton: {
    padding: 10,
  },
  monthButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e7cf8",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  expensesList: {
    width: "90%",
  },
  noExpenses: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 30,
  },
  dayGroup: {
    marginBottom: 20,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  expenseItem: {
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
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  expenseDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  expenseTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  expenseRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  expenseAmount: {
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
  addButton: {
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
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

});