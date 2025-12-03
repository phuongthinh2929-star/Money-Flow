import React from 'react';
import { AppSettings } from '../types';
import { Moon, Sun, Table, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClearData }) => {
  
  const toggleDarkMode = () => {
    onUpdate({ ...settings, darkMode: !settings.darkMode });
  };

  const toggleDailyLimit = () => {
    onUpdate({ ...settings, dailyLimitEnabled: !settings.dailyLimitEnabled });
  };

  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right-4 duration-500">
      
      {/* Appearance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sun size={20} className="text-yellow-500" /> Giao diện
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Chế độ tối (Dark Mode)</span>
          <button 
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${settings.darkMode ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${settings.darkMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-blue-500" /> Tính năng
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="block text-gray-600 dark:text-gray-300">Giới hạn chi tiêu ngày</span>
            <span className="text-xs text-gray-400">Hiển thị mức chi an toàn trên dashboard</span>
          </div>
          <button 
            onClick={toggleDailyLimit}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${settings.dailyLimitEnabled ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${settings.dailyLimitEnabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </section>

      {/* Integration */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Table size={20} className="text-green-600" /> Google Sheets
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Đồng bộ giao dịch với Google Sheet cá nhân để sao lưu và phân tích.
        </p>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Nhập Spreadsheet ID" 
            value={settings.googleSheetId || ''}
            onChange={(e) => onUpdate({...settings, googleSheetId: e.target.value})}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white"
          />
          <button className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 rounded-xl transition">
            {settings.isSheetConnected ? 'Đồng bộ ngay' : 'Kết nối Sheet (Mô phỏng)'}
          </button>
          <p className="text-xs text-gray-400 italic">
            Lưu ý: Phiên bản demo lưu dữ liệu tại trình duyệt. Trường nhập ID Google Sheet dùng để mô phỏng tính năng tích hợp.
          </p>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
        <h3 className="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} /> Vùng nguy hiểm
        </h3>
        <button 
          onClick={() => {
            if(window.confirm('Bạn có chắc không? Hành động này sẽ xóa toàn bộ dữ liệu.')) {
              onClearData();
            }
          }}
          className="w-full bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 transition font-semibold py-3 rounded-xl"
        >
          Xóa toàn bộ dữ liệu
        </button>
      </section>
      
      <div className="text-center text-xs text-gray-400">
        MoneyFlow v1.0.0 • Mobile First Design
      </div>
    </div>
  );
};

export default Settings;