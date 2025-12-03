import { Category, TransactionType } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Lương', type: TransactionType.INCOME, color: '#10b981' },
  { id: 'c2', name: 'Thưởng/Khác', type: TransactionType.INCOME, color: '#34d399' },
  { id: 'c3', name: 'Ăn uống', type: TransactionType.EXPENSE, budget: 5000000, color: '#f59e0b' },
  { id: 'c4', name: 'Di chuyển', type: TransactionType.EXPENSE, budget: 1000000, color: '#3b82f6' },
  { id: 'c5', name: 'Điện nước', type: TransactionType.EXPENSE, budget: 2000000, color: '#8b5cf6' },
  { id: 'c6', name: 'Giải trí', type: TransactionType.EXPENSE, budget: 1500000, color: '#ec4899' },
  { id: 'c7', name: 'Mua sắm', type: TransactionType.EXPENSE, budget: 3000000, color: '#f43f5e' },
  { id: 'c8', name: 'Khác', type: TransactionType.EXPENSE, budget: 1000000, color: '#6b7280' },
];

export const MOCK_TRANSACTIONS_KEY = 'moneyflow_transactions';
export const SETTINGS_KEY = 'moneyflow_settings';
export const CATEGORIES_KEY = 'moneyflow_categories';

export const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6b7280'];