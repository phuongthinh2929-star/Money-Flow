import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { X, Check, CalendarClock } from 'lucide-react';

// Simple ID generator since we might not have 'uuid' installed in the environment
const generateId = () => Math.random().toString(36).substr(2, 9);

interface TransactionFormProps {
  onClose: () => void;
  onSave: (t: Transaction) => void;
  categories: Category[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSave, categories }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  // Allocation State
  const [allocationDays, setAllocationDays] = useState<number>(1);
  const [showCustomAllocation, setShowCustomAllocation] = useState(false);

  // Auto-select first category of type
  useEffect(() => {
    const firstCat = categories.find(c => c.type === type);
    if (firstCat) setCategoryId(firstCat.id);
  }, [type, categories]);

  // Smart suggestions
  const amount = parseFloat(amountStr) || 0;
  const suggestions = amount > 0 
    ? [amount * 10, amount * 100, amount * 1000].filter(v => v < 100000000) 
    : [50000, 100000, 500000];

  const handleSuggestionClick = (val: number) => {
    setAmountStr(val.toString());
  };

  const handleAllocationPreset = (days: number | 'MONTH') => {
    setShowCustomAllocation(false);
    if (days === 'MONTH') {
      const d = new Date(date);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const remaining = lastDay - d.getDate() + 1;
      setAllocationDays(remaining > 0 ? remaining : 1);
    } else {
      setAllocationDays(days);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const newTransaction: Transaction = {
      id: generateId(),
      amount: amount,
      type: type,
      categoryId: categoryId,
      date: date,
      note: note,
      allocationDuration: type === TransactionType.EXPENSE ? allocationDays : 1,
      createdAt: Date.now(),
    };

    onSave(newTransaction);
    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full sm:w-[480px] h-[95vh] sm:h-auto sm:rounded-2xl rounded-t-3xl p-6 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Thêm giao dịch</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X className="dark:text-gray-400" />
          </button>
        </div>

        {/* Toggle Type */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          <button
            type="button"
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
              type === TransactionType.EXPENSE
                ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setType(TransactionType.EXPENSE)}
          >
            Chi tiêu
          </button>
          <button
            type="button"
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
              type === TransactionType.INCOME
                ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setType(TransactionType.INCOME)}
          >
            Thu nhập
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Số tiền</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full text-4xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none py-2 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
              />
              <span className="absolute right-0 bottom-4 text-gray-400 font-medium">VND</span>
            </div>
            {/* Suggestions Strip */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar">
              {suggestions.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSuggestionClick(val)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                >
                  {val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation Section (Only for Expense) */}
          {type === TransactionType.EXPENSE && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock size={16} className="text-orange-500" />
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phân bổ chi phí</label>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                Chia nhỏ chi phí này cho nhiều ngày để tính hạn mức chi tiêu mỗi ngày chính xác hơn.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Không', val: 1 },
                  { label: '3 ngày', val: 3 },
                  { label: '7 ngày', val: 7 },
                  { label: 'Hết tháng', val: 'MONTH' }
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleAllocationPreset(opt.val as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                      (!showCustomAllocation && (opt.val === 'MONTH' ? allocationDays > 27 && allocationDays < 32 : allocationDays === opt.val))
                        ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                
                <button
                    type="button"
                    onClick={() => setShowCustomAllocation(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                      showCustomAllocation
                        ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                >
                    Tùy chọn
                </button>
              </div>

              {showCustomAllocation && (
                <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <span className="text-sm text-gray-500">Số ngày:</span>
                    <input 
                        type="number" 
                        min="1"
                        max="365"
                        value={allocationDays} 
                        onChange={(e) => setAllocationDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 p-1.5 text-center text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-orange-500"
                    />
                </div>
              )}
              
              {allocationDays > 1 && (
                  <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 italic">
                      ~ {Math.round(amount / allocationDays).toLocaleString()} VND / ngày
                  </div>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Danh mục</label>
            <div className="grid grid-cols-2 gap-3">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    categoryId === cat.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/20'
                      : 'border-transparent bg-gray-5 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="font-semibold text-sm dark:text-gray-200">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Ngày</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Ghi chú (Tùy chọn)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Ăn trưa..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </form>

        <button
          onClick={handleSubmit}
          disabled={!amount || !categoryId}
          className="w-full mt-6 bg-primary hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <Check size={20} />
          Lưu giao dịch
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;