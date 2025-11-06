import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExportScreenProps {
  expenses: Expense[];
  isDark: boolean;
  onClose: () => void;
}

export default function ExportScreen({ expenses, isDark, onClose }: ExportScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const getFilteredExpenses = () => {
    const now = new Date();
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return expDate >= weekAgo;
        case 'month':
          return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
        case 'year':
          return expDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const generateCSV = () => {
    const filtered = getFilteredExpenses();
    const headers = 'Date,Category,Amount,Description\n';
    const rows = filtered.map(exp => 
      `${new Date(exp.date).toLocaleDateString()},${exp.category},${exp.amount},"${exp.description}"`
    ).join('\n');
    return headers + rows;
  };

  const exportToCSV = async () => {
    try {
      const filtered = getFilteredExpenses();
      if (filtered.length === 0) {
        Alert.alert('No Data', 'No expenses found for the selected period');
        return;
      }

      const csvContent = generateCSV();
      const fileName = `expenses_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Expenses',
      });
      
      Alert.alert('Success', 'Expenses exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to export expenses: ${errorMessage}`);
    }
  };



  const exportToPDF = async () => {
    Alert.alert('PDF Export', 'PDF export feature coming soon!');
  };

  const filtered = getFilteredExpenses();
  const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Export Data</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={isDark ? "#fff" : "#333"} />
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Select Period</Text>
        <View style={styles.periodButtons}>
          {(['week', 'month', 'year'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
                isDark && styles.periodButtonDark,
                selectedPeriod === period && isDark && styles.periodButtonActiveDark
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
                isDark && styles.periodButtonTextDark
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.summary, isDark && styles.summaryDark]}>
        <Text style={[styles.summaryText, isDark && styles.summaryTextDark]}>
          {filtered.length} expenses • ₹{total.toFixed(2)}
        </Text>
      </View>

      <View style={styles.exportOptions}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Export Format</Text>
        
        <TouchableOpacity 
          style={[styles.exportButton, isDark && styles.exportButtonDark]}
          onPress={exportToCSV}
        >
          <Ionicons name="document-text-outline" size={24} color="#1e7cf8" />
          <View style={styles.exportButtonContent}>
            <Text style={[styles.exportButtonTitle, isDark && styles.exportButtonTitleDark]}>Excel/CSV</Text>
            <Text style={[styles.exportButtonDesc, isDark && styles.exportButtonDescDark]}>
              Export as spreadsheet file
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.exportButton, isDark && styles.exportButtonDark]}
          onPress={exportToPDF}
        >
          <Ionicons name="document-outline" size={24} color="#ff6b6b" />
          <View style={styles.exportButtonContent}>
            <Text style={[styles.exportButtonTitle, isDark && styles.exportButtonTitleDark]}>PDF Report</Text>
            <Text style={[styles.exportButtonDesc, isDark && styles.exportButtonDescDark]}>
              Generate formatted report
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  titleDark: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  periodSelector: {
    marginBottom: 30,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  periodButtonDark: {
    backgroundColor: '#1c1c1e',
    borderColor: '#444',
  },
  periodButtonActive: {
    backgroundColor: '#1e7cf8',
    borderColor: '#1e7cf8',
  },
  periodButtonActiveDark: {
    backgroundColor: '#1e7cf8',
  },
  periodButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextDark: {
    color: '#fff',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  summaryDark: {
    backgroundColor: '#1c1c1e',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summaryTextDark: {
    color: '#fff',
  },
  exportOptions: {
    flex: 1,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  exportButtonDark: {
    backgroundColor: '#1c1c1e',
  },
  exportButtonContent: {
    flex: 1,
    marginLeft: 15,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  exportButtonTitleDark: {
    color: '#fff',
  },
  exportButtonDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  exportButtonDescDark: {
    color: '#999',
  },
});