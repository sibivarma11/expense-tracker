import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface SummaryViewProps {
  expenses: Expense[];
  isDark?: boolean;
}

export default function SummaryView({ expenses, isDark }: SummaryViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  const getSummaries = () => {
    const summaries: { [key: string]: number } = {};
    expenses.forEach(exp => {
      const d = new Date(exp.date);
      const key =
        viewMode === "month"
          ? `${d.getFullYear()}-${d.getMonth() + 1}`
          : `${d.getFullYear()}`;
      summaries[key] = (summaries[key] || 0) + exp.amount;
    });
    return summaries;
  };

  const data = Object.entries(getSummaries()).sort();

  return (
    <View style={[styles.container, isDark && styles.dark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setViewMode("month")}>
          <Text style={[styles.toggle, viewMode === "month" && styles.active]}>
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode("year")}>
          <Text style={[styles.toggle, viewMode === "year" && styles.active]}>
            Yearly
          </Text>
        </TouchableOpacity>
      </View>

      {data.map(([period, total]) => (
        <View key={period} style={styles.row}>
          <Text style={styles.period}>{period}</Text>
          <Text style={styles.amount}>₹{total.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    width: "90%",
  },
  dark: {
    backgroundColor: "#222",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  toggle: {
    fontSize: 16,
    color: "#eee",
  },
  active: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  period: {
    fontSize: 15,
    color: "#eee",
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#eee",
  },
});
