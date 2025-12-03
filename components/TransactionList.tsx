import React, { useMemo, useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { formatCurrency } from '../services/storageService';
import { Trash2, Search, Filter, Clock } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  currency: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, onDelete, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');

  // Sort by date desc
  const sorted = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // Filter
  const filtered = useMemo(() => {
    return sorted.filter(t => {
      const matchesSearch = (t.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                            categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [sorted, searchTerm, filterType, categories]);

  // Group by Date
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      const dateStr = t.date;
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(t);
    });
    return groups;
  }, [filtered]);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Khác';
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#ccc';

  return (
    <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Filters */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-2 space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border-none rounded-xl py-3 pl-10 pr-4 shadow-sm focus:ring-2 focus:ring-primary dark:text-white"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filterType === 'ALL' ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilterType(TransactionType.EXPENSE)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filterType === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
          >
            Chi tiêu
          </button>
          <button 
            onClick={() => setFilterType(TransactionType.INCOME)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filterType === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
          >
            Thu nhập
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Filter className="mx-auto mb-2 opacity-50" />
            <p>Không tìm thấy giao dịch nào.</p>
          </div>
        ) : (
          Object.keys(grouped).map(date => (
            <div key={date}>
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sticky top-28">{new Date(date).toLocaleDateString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric' })}</h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {grouped[date].map((t, idx) => (
                  <div key={t.id} className={`flex items-center justify-between p-4 ${idx !== grouped[date].length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: getCategoryColor(t.categoryId) }}>
                        {getCategoryName(t.categoryId).charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{getCategoryName(t.categoryId)}</div>
                        {t.note && <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{t.note}</div>}
                        {t.allocationDuration && t.allocationDuration > 1 && (
                            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                                <Clock size={10} />
                                <span>Phân bổ {t.allocationDuration} ngày</span>
                            </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                      <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {t.type === TransactionType.EXPENSE ? '-' : '+'}{formatCurrency(t.amount, currency)}
                      </span>
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="text-gray-300 hover:text-red-500 transition p-1 -mr-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;