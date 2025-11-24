import * as SQLite from 'expo-sqlite';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('expenses.db');
      await this.createTable();
    }
  }

  private async createTable() {
    await this.db!.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        paymentMethod TEXT,
        date TEXT NOT NULL
      );
    `);
    
    // Add paymentMethod column if it doesn't exist
    try {
      await this.db!.execAsync('ALTER TABLE expenses ADD COLUMN paymentMethod TEXT');
    } catch (error) {
      // Column already exists, ignore error
    }
  }

  async getExpenses(): Promise<Expense[]> {
    await this.init();
    const result = await this.db!.getAllAsync('SELECT * FROM expenses ORDER BY date DESC');
    return result.map((row: any) => ({
      id: row.id.toString(),
      amount: row.amount,
      category: row.category,
      description: row.description || '',
      paymentMethod: row.paymentMethod || '',
      date: row.date
    }));
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    await this.init();
    const result = await this.db!.runAsync(
      'INSERT INTO expenses (amount, category, description, paymentMethod, date) VALUES (?, ?, ?, ?, ?)',
      [expense.amount, expense.category, expense.description, expense.paymentMethod, expense.date]
    );
    
    return {
      id: result.lastInsertRowId!.toString(),
      ...expense
    };
  }

  async deleteExpense(id: string): Promise<void> {
    await this.init();
    await this.db!.runAsync('DELETE FROM expenses WHERE id = ?', [parseInt(id)]);
  }
}

export const dbService = new DatabaseService();