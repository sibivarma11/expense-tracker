import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
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
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showPopup = (type: 'success' | 'error' | 'info', message: string) => {
    setPopupType(type);
    setPopupMessage(message);
    setPopupVisible(true);
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const hidePopup = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setPopupVisible(false));
  };

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
        showPopup('info', 'No expenses found for the selected period.');
        return;
      }

      const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
      let html = `
        <html><head><style>
          body { font-family: Arial; margin: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background: #f2f2f2; }
        </style></head><body>
        <h1>Expense Report - ${selectedPeriod}</h1>
        <table>
          <tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr>
      `;
      filtered.forEach(exp => {
        html += `<tr>
          <td>${new Date(exp.date).toLocaleDateString()}</td>
          <td>${exp.category}</td>
          <td>₹${exp.amount.toFixed(2)}</td>
          <td>${exp.description || '-'}</td>
        </tr>`;
      });
      html += `<tr><td colspan="2"><strong>Total</strong></td><td colspan="2"><strong>₹${total.toFixed(2)}</strong></td></tr></table></body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      showPopup('success', 'PDF exported successfully!');
    } catch (error: any) {
      showPopup('error', `Failed to export PDF: ${error.message}`);
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
                isDark ? styles.periodButtonDark : {},
                selectedPeriod === period &&
                  (isDark ? styles.periodButtonActiveDark : styles.periodButtonActive),
              ]}

              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                  isDark && styles.periodButtonTextDark,
                ]}
              >
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

      <Modal transparent visible={popupVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View style={[
            styles.popupContainer,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            popupType === 'success' && styles.popupSuccess,
            popupType === 'error' && styles.popupError,
            popupType === 'info' && styles.popupInfo,
          ]}>
            <Ionicons
              name={
                popupType === 'success' ? 'checkmark-circle' :
                popupType === 'error' ? 'alert-circle' :
                'information-circle'
              }
              size={40}
              color="#fff"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.popupText}>{popupMessage}</Text>
            <TouchableOpacity onPress={hidePopup} style={styles.popupButton}>
              <Text style={styles.popupButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    backgroundColor: '#3b82f6', // visible blue in dark mode
    borderColor: '#3b82f6',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '80%',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  popupSuccess: { backgroundColor: '#28a745' },
  popupError: { backgroundColor: '#dc3545' },
  popupInfo: { backgroundColor: '#007bff' },
  popupText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  popupButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  popupButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});