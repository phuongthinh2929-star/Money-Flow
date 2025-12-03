import { Transaction, Category, AppSettings } from '../types';
import { MOCK_TRANSACTIONS_KEY, CATEGORIES_KEY, DEFAULT_CATEGORIES, SETTINGS_KEY } from '../constants';

export const getStoredTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(MOCK_TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getStoredCategories = (): Category[] => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const getStoredSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) return JSON.parse(stored);
  return {
    currency: 'VND',
    darkMode: false,
    isSheetConnected: false,
    dailyLimitEnabled: true,
  };
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Formatting helpers
export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};