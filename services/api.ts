const API_BASE_URL = 'http://13.232.36.62:3000';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
}

export const expenseAPI = {
  // Get all expenses
  getExpenses: async (): Promise<Expense[]> => {
    const response = await fetch(`${API_BASE_URL}/expenses`);
    return response.json();
  },

  // Add new expense
  addExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await fetch(`${API_BASE_URL}/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    return response.json();
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/expense/${id}`, {
      method: 'DELETE',
    });
  },

  // Update expense
  updateExpense: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    return response.json();
  },
};