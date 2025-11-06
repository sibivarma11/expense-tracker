import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Props {
  expenses: Expense[];
  isDark?: boolean;
}

export default function SpendingTrends({ expenses, isDark }: Props) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTotals = new Array(12).fill(0);

  expenses.forEach(exp => {
    const d = new Date(exp.date);
    monthlyTotals[d.getMonth()] += exp.amount;
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && styles.darkTitle]}>Spending Trend</Text>
      <LineChart
        data={{
          labels: months,
          datasets: [{ data: monthlyTotals }],
        }}
        width={Dimensions.get("window").width - 40}
        height={220}
        yAxisLabel="₹"
        chartConfig={{
          backgroundGradientFrom: isDark ? "#222" : "#fff",
          backgroundGradientTo: isDark ? "#111" : "#f5f5f5",
          color: () => (isDark ? "#fff" : "#007AFF"),
          labelColor: () => (isDark ? "#fff" : "#333"),
          propsForDots: {
            r: "4",
            strokeWidth: "1",
            stroke: "#007AFF",
          },
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  darkTitle: {
    color: "#fff",
  },
  chart: {
    borderRadius: 12,
  },
});
