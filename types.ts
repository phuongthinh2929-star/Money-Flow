export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  budget?: number; // Monthly budget for this category
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO Date string YYYY-MM-DD
  note?: string;
  tags?: string[];
  allocationDuration?: number; // Number of days this cost is allocated over. Default is 1.
  createdAt: number;
}

export interface AppSettings {
  currency: string;
  darkMode: boolean;
  googleSheetId?: string;
  isSheetConnected: boolean;
  dailyLimitEnabled: boolean;
}

export interface AISuggestion {
  message: string;
  type: 'warning' | 'tip' | 'success';
}