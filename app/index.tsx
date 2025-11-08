import SummaryView from "@/components/SummaryView";
import * as SQLite from 'expo-sqlite';
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import AddButton from '../components/AddButton';
import AddExpenseModal from '../components/AddExpenseModal';
import DateSelector from '../components/DateSelector';
import ExpenseList from '../components/ExpenseList';
import ExportScreen from '../screens/ExportScreen';
import SideDrawer from '../components/SideDrawer';
import SummaryCard from '../components/SummaryCard';

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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const gestureTranslateX = useRef(new Animated.Value(0)).current;

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
    setPaymentMethod("");
    setIsOpen(false);
  };

  const deleteExpense = async (id: string) => {
    const db = await SQLite.openDatabaseAsync('expenses.db');
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getDate() === selectedDate.getDate() &&
             expDate.getMonth() === selectedDate.getMonth() &&
             expDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const getTotalExpense = () => {
    return getFilteredExpenses().reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getCategoryBreakdown = () => {
    const filtered = getFilteredExpenses();
    const breakdown: { [key: string]: number } = {};
    filtered.forEach(exp => {
      if (!breakdown[exp.category]) breakdown[exp.category] = 0;
      breakdown[exp.category] += exp.amount;
    });
    return breakdown;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = () => {
    const now = new Date();
    return selectedDate.getDate() === now.getDate() &&
           selectedDate.getMonth() === now.getMonth() &&
           selectedDate.getFullYear() === now.getFullYear();
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
    if (state === State.BEGAN) translateX.stopAnimation();
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

  if (showExport) {
    return (
      <ExportScreen
        expenses={expenses}
        isDark={isDark}
        onClose={() => setShowExport(false)}
      />
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <SideDrawer
        animatedTranslateX={animatedTranslateX}
        isDark={isDark}
        onToggleTheme={() => setManualTheme(isDark ? 'light' : 'dark')}
        onExport={() => {
          setShowExport(true);
          closeDrawer();
        }}
      />

      {drawerOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={closeDrawer}
          activeOpacity={1}
        />
      )}

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
            <SummaryCard
              totalExpense={getTotalExpense()}
              categoryBreakdown={getCategoryBreakdown()}
              isDark={isDark}
            />

            <SummaryView
              expenses={expenses}
              isDark={isDark}
            />

            <DateSelector
              selectedDate={selectedDate}
              onChangeDate={changeDate}
              onGoToToday={() => setSelectedDate(new Date())}
              isToday={isToday()}
              isDark={isDark}
            />

            <ExpenseList
              expenses={getFilteredExpenses()}
              onDeleteExpense={deleteExpense}
              isDark={isDark}
            />
          </ScrollView>

          <AddButton
            onPress={() => setIsOpen(true)}
            disabled={!isToday()}
            isToday={isToday()}
          />

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
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
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