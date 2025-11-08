import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

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

  const exportToPDF = async () => {
    try {
      const filtered = getFilteredExpenses();
      if (filtered.length === 0) {
        Alert.alert('No Data', 'No expenses found for the selected period');
        return;
      }

      console.log('Starting PDF export...');
      const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
      let html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .total { font-weight: bold; background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Expense Report - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr>
      `;
      
      filtered.forEach(exp => {
        html += `<tr><td>${new Date(exp.date).toLocaleDateString()}</td><td>${exp.category}</td><td>₹${exp.amount.toFixed(2)}</td><td>${exp.description || '-'}</td></tr>`;
      });
      
      html += `
              <tr class="total"><td colspan="2"><strong>Total</strong></td><td><strong>₹${total.toFixed(2)}</strong></td><td></td></tr>
            </table>
          </body>
        </html>
      `;

      console.log('Generating PDF...');
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF generated at:', uri);
      
      console.log('Sharing PDF...');
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      
      Alert.alert('Success', 'PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to export PDF: ${errorMessage}`);
    }
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
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exportButtonDark: {
    backgroundColor: '#1c1c1e',
    borderColor: '#444',
  },
  exportButtonContent: {
    flex: 1,
    marginLeft: 15,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exportButtonTitleDark: {
    color: '#fff',
  },
  exportButtonDesc: {
    fontSize: 14,
    color: '#666',
  },
  exportButtonDescDark: {
    color: '#999',
  },
});