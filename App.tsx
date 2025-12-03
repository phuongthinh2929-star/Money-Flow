import React, { useState, useEffect } from 'react';
import { Transaction, Category, AppSettings } from './types';
import { 
  getStoredTransactions, saveTransactions, 
  getStoredCategories, saveCategories,
  getStoredSettings, saveSettings 
} from './services/storageService';
import { DEFAULT_CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Settings from './components/Settings';
import { LayoutDashboard, History, Settings as SettingsIcon, Plus } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    currency: 'VND', darkMode: false, isSheetConnected: false, dailyLimitEnabled: true 
  });
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);

  // Initialization
  useEffect(() => {
    setTransactions(getStoredTransactions());
    const storedCats = getStoredCategories();
    // Use stored categories if they exist and are not default, otherwise use default translated ones
    setCategories(storedCats);
    setSettings(getStoredSettings());
  }, []);

  // Effect for Dark Mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Handlers
  const handleSaveTransaction = (t: Transaction) => {
    const updated = [t, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleUpdateSettings = (s: AppSettings) => {
    setSettings(s);
    saveSettings(s);
  };

  const handleClearData = () => {
    localStorage.clear();
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setSettings({ currency: 'VND', darkMode: false, isSheetConnected: false, dailyLimitEnabled: true });
    window.location.reload();
  };

  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto bg-gray-50 dark:bg-gray-900 border-x border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
      
      {/* Main Content Area - Header removed to push content up */}
      <main className="p-4 sm:p-6 min-h-[90vh] pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            transactions={transactions} 
            categories={categories} 
            settings={settings} 
          />
        )}
        {activeTab === 'history' && (
          <TransactionList 
            transactions={transactions} 
            categories={categories} 
            onDelete={handleDeleteTransaction}
            currency={settings.currency}
          />
        )}
        {activeTab === 'settings' && (
          <Settings 
            settings={settings} 
            onUpdate={handleUpdateSettings} 
            onClearData={handleClearData}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-24 right-4 sm:right-[calc(50%-10rem)] z-20">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-500/40 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <TransactionForm 
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveTransaction}
          categories={categories}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe flex justify-around items-center h-20 z-30">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition ${activeTab === 'dashboard' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium">Tổng quan</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition ${activeTab === 'history' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
        >
          <History size={24} />
          <span className="text-[10px] font-medium">Lịch sử</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition ${activeTab === 'settings' ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
        >
          <SettingsIcon size={24} />
          <span className="text-[10px] font-medium">Cài đặt</span>
        </button>
      </nav>
    </div>
  );
};

export default App;