import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface SummaryCardProps {
  totalExpense: number;
  categoryBreakdown: { [key: string]: number };
  isDark: boolean;
}

export default function SummaryCard({ totalExpense, categoryBreakdown, isDark }: SummaryCardProps) {
  return (
    <LinearGradient
      colors={isDark ? ['#1e3a8a', '#3b82f6', '#60a5fa'] : ['#1e7cf8', '#3b82f6', '#60a5fa']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
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
  );
}

const styles = StyleSheet.create({
  card: {
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
});