import { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Switch, ScrollView, useColorScheme, Animated, Dimensions } from "react-native";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import AddExpenseModal from '../components/AddExpenseModal';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function Index() {
  const colorScheme = useColorScheme();
  const [manualTheme, setManualTheme] = useState<'light' | 'dark' | null>(null);
  const isDark = manualTheme ? manualTheme === 'dark' : colorScheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const gestureTranslateX = useRef(new Animated.Value(0)).current;

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
      date: selectedDate.toISOString(),
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

  // Filter expenses by selected date (same day)
  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getDate() === selectedDate.getDate() &&
             expDate.getMonth() === selectedDate.getMonth() &&
             expDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  // Calculate totals for selected day
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

  const filteredExpenses = getFilteredExpenses();
  const totalExpense = getTotalExpense();
  const categoryBreakdown = getCategoryBreakdown();

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = () => {
    const now = new Date();
    return selectedDate.getDate() === now.getDate() &&
           selectedDate.getMonth() === now.getMonth() &&
           selectedDate.getFullYear() === now.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    Animated.timing(translateX, {
      toValue: -DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: gestureTranslateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    const { state, translationX, velocityX } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      translateX.stopAnimation();
    }
    
    if (state === State.END || state === State.CANCELLED) {
      const currentPosition = drawerOpen ? 0 : -DRAWER_WIDTH;
      const finalPosition = currentPosition + translationX;
      
      gestureTranslateX.setValue(0);
      translateX.setValue(finalPosition);
      
      if (finalPosition > -DRAWER_WIDTH / 2 || velocityX > 500) {
        openDrawer();
      } else {
        closeDrawer();
      }
    }
  };

  const animatedTranslateX = Animated.add(translateX, gestureTranslateX);

  const toggleTheme = () => {
    setManualTheme(isDark ? 'light' : 'dark');
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Side Drawer */}
      <Animated.View style={[styles.drawer, isDark && styles.drawerDark, { transform: [{ translateX: animatedTranslateX }] }]}>
        <View style={styles.drawerContent}>
          <TouchableOpacity style={styles.drawerItem}>
            <Ionicons name="grid-outline" size={24} color={isDark ? "#fff" : "#333"} />
            <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem}>
            <Ionicons name="bar-chart-outline" size={24} color={isDark ? "#fff" : "#333"} />
            <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem}>
            <Ionicons name="settings-outline" size={24} color={isDark ? "#fff" : "#333"} />
            <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]}>Settings</Text>
          </TouchableOpacity>
          <View style={styles.drawerItem}>
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={24}
              color={isDark ? "#fff" : "#333"}
            />
            <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]}>
              {/* Theme */}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#ccc", true: "#555" }}
              thumbColor={isDark ? "#fff" : "#333"}
            />
          </View>
        </View>
      </Animated.View>

      {/* Overlay */}
      {drawerOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={closeDrawer}
          activeOpacity={1}
        />
      )}

      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={10}
        failOffsetY={[-30, 30]}
        shouldCancelWhenOutside={false}
        enabled={!isOpen}
      >
        <Animated.View style={styles.mainContent}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Summary Card */}
            <LinearGradient
              colors={isDark ? ['#1e3a8a', '#3b82f6', '#60a5fa'] : ['#1e7cf8', '#3b82f6', '#60a5fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.expense}
            >
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
            </LinearGradient>

            {/* Date Selector */}
            <View style={[styles.dateSelector, isDark && styles.dateSelectorDark]}>
              <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
                <Text style={styles.dateButtonText}>←</Text>
              </TouchableOpacity>
              <View style={styles.dateTextContainer}>
                <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
                  {formatDate(selectedDate)}
                </Text>
                {!isToday() && (
                  <TouchableOpacity onPress={goToToday}>
                    <Text style={styles.todayButton}>Go to Today</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
                <Text style={styles.dateButtonText}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Expenses List */}
            <View style={styles.expensesList}>
              {filteredExpenses.length === 0 ? (
                <Text style={[styles.noExpenses, isDark && styles.noExpensesDark]}>
                  No expenses for this day
                </Text>
              ) : (
                filteredExpenses.map(exp => (
                  <View key={exp.id} style={[styles.expenseItem, isDark && styles.expenseItemDark]}>
                    <View style={styles.expenseInfo}>
                      <Text style={[styles.expenseCategory, isDark && styles.expenseCategoryDark]}>
                        {exp.category}
                      </Text>
                      {exp.description && (
                        <Text style={[styles.expenseDescription, isDark && styles.expenseDescriptionDark]}>
                          {exp.description}
                        </Text>
                      )}
                      <Text style={[styles.expenseTime, isDark && styles.expenseTimeDark]}>
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
                ))
              )}
            </View>
          </ScrollView>

          {/* Add Expense Button */}
          <TouchableOpacity
            onPress={() => setIsOpen(true)}
            style={[styles.addButton, !isToday() && styles.disabledButton]}
            disabled={!isToday()}
          >
            <Text style={[styles.addButtonText, !isToday() && styles.disabledButtonText]}>
              + Add Expense
            </Text>
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
            isDark={isDark}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerDark: {
    backgroundColor: "#000",
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
  dateSelector: {
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
  dateSelectorDark: {
    backgroundColor: "#1c1c1e",
  },
  dateButton: {
    padding: 10,
  },
  dateButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e7cf8",
  },
  dateTextContainer: {
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
  expensesList: {
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
  expenseItemDark: {
    backgroundColor: "#1c1c1e",
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  expenseCategoryDark: {
    color: "#fff",
  },
  expenseDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  expenseDescriptionDark: {
    color: "#999",
  },
  expenseTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  expenseTimeDark: {
    color: "#666",
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
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#999",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  drawerDark: {
    backgroundColor: "#1c1c1e",
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
    marginTop: 40,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerItemText: {
    fontSize: 18,
    color: "#333",
    marginLeft: 15,
  },
  drawerItemTextDark: {
    color: "#fff",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  mainContent: {
    flex: 1,
  },
});