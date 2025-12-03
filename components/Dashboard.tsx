import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, Category, TransactionType, AppSettings } from '../types';
import { formatCurrency } from '../services/storageService';
import { analyzeFinances, AIAnalysisResult } from '../services/geminiService';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Loader2, CheckCircle2, AlertTriangle, Info, CalendarClock } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, categories, settings }) => {
  const [aiInsight, setAiInsight] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Filter for current month
  const currentMonthData = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  // Calculations: Cash Flow
  const totalIncome = currentMonthData
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = currentMonthData
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Daily Limit Calculation (Cash Based - Hard Limit)
  const dailyLimit = useMemo(() => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = lastDayOfMonth - now.getDate() + 1; // Include today
    // Prevent division by zero or negative
    return daysRemaining > 0 ? Math.max(0, balance / daysRemaining) : 0;
  }, [balance]);

  // Amortized Daily Expense Calculation (Allocated Spend for Today)
  const amortizedDailyExpense = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayTime = today.getTime();

    // Look at ALL transactions, not just this month, because a transaction from last month could span into today
    let dailyBurn = 0;

    transactions.forEach(t => {
      if (t.type === TransactionType.EXPENSE) {
        const tDate = new Date(t.date);
        tDate.setHours(0,0,0,0);
        const tTime = tDate.getTime();
        
        const duration = t.allocationDuration || 1;
        // Calculate end date of allocation
        // Date + Duration days. If duration is 1, it ends same day.
        const endDate = new Date(tDate);
        endDate.setDate(endDate.getDate() + duration); // Exclusive end date logic usually, but let's treat duration as "inclusive count"
        // Wait, if I spend on day 1 for 3 days. Days are 1, 2, 3.
        // tTime is start. tTime + (duration-1)*24h is last active day.
        
        const dayInMillis = 24 * 60 * 60 * 1000;
        const endTime = tTime + (duration * dayInMillis); 

        // Check if today falls within [tTime, endTime)
        if (todayTime >= tTime && todayTime < endTime) {
           dailyBurn += (t.amount / duration);
        }
      }
    });
    return dailyBurn;
  }, [transactions]);

  // Chart Data Preparation
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    currentMonthData.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      if (cat) {
        map.set(cat.name, (map.get(cat.name) || 0) + t.amount);
      }
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [currentMonthData, categories]);

  // AI Handler
  const handleAskAI = async () => {
    setIsLoadingAI(true);
    try {
      const result = await analyzeFinances(transactions, categories);
      if (result) {
        setAiInsight(result);
      } else {
        // Fallback error object
        setAiInsight({
            sentiment: 'WARNING',
            title: 'Lỗi kết nối',
            message: 'Không thể kết nối với chuyên gia AI lúc này. Vui lòng thử lại sau.',
            actionItem: 'Kiểm tra kết nối mạng hoặc API Key.'
        });
      }
    } catch (e) {
      setAiInsight(null);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getCategoryColor = (name: string) => {
    return categories.find(c => c.name === name)?.color || '#9ca3af';
  };

  // Styles based on sentiment
  const getAIStyles = (sentiment: string) => {
    switch (sentiment) {
        case 'GOOD':
            return {
                bg: 'bg-gradient-to-br from-emerald-600 to-teal-600',
                icon: <CheckCircle2 className="text-emerald-100" size={24} />,
                border: 'border-emerald-500/30'
            };
        case 'CRITICAL':
            return {
                bg: 'bg-gradient-to-br from-red-600 to-rose-600',
                icon: <AlertTriangle className="text-red-100" size={24} />,
                border: 'border-red-500/30'
            };
        case 'WARNING':
        default:
            return {
                bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
                icon: <Info className="text-amber-100" size={24} />,
                border: 'border-amber-500/30'
            };
    }
  };

  const aiStyle = aiInsight ? getAIStyles(aiInsight.sentiment) : getAIStyles('WARNING');

  // Daily Status Logic
  const isDailyOverLimit = amortizedDailyExpense > dailyLimit;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Số dư hiện tại</div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {formatCurrency(balance, settings.currency)}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-400">
                <TrendingUp size={16} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Thu nhập</span>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome, settings.currency)}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-red-100 dark:bg-red-800 rounded-full text-red-600 dark:text-red-400">
                <TrendingDown size={16} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Chi tiêu</span>
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpense, settings.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Safe-to-Spend & Consumption Logic */}
      {settings.dailyLimitEnabled && (
        <div className="grid grid-cols-1 gap-4">
            {/* Safe Limit */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-xl">
            <div className="flex justify-between items-start">
                <div>
                <h3 className="text-blue-800 dark:text-blue-300 font-semibold text-sm uppercase tracking-wide">Mức chi tối đa / ngày</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Dựa trên số dư còn lại
                </p>
                </div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(dailyLimit, settings.currency)}
                </div>
            </div>
            </div>

            {/* Actual Daily Burn (Amortized) */}
            <div className={`p-4 rounded-r-xl border-l-4 ${isDailyOverLimit ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'bg-gray-50 dark:bg-gray-800 border-gray-400'}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`${isDailyOverLimit ? 'text-orange-800 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'} font-semibold text-sm uppercase tracking-wide`}>
                                Tiêu hao thực tế hôm nay
                            </h3>
                            <div className="relative group">
                                <Info size={14} className="text-gray-400 cursor-help"/>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                                    Đã bao gồm các khoản chi phân bổ (vd: tiền nhà chia cho 30 ngày).
                                </div>
                            </div>
                        </div>
                        <p className={`text-xs mt-1 ${isDailyOverLimit ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isDailyOverLimit ? 'Bạn đang chi tiêu quá mức an toàn!' : 'Đang trong mức kiểm soát.'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className={`text-xl font-bold ${isDailyOverLimit ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-200'}`}>
                            {formatCurrency(amortizedDailyExpense, settings.currency)}
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar comparing Burn vs Limit */}
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${isDailyOverLimit ? 'bg-orange-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((amortizedDailyExpense / (dailyLimit || 1)) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
      )}

      {/* AI Advisor Section */}
      <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-500 ${aiInsight ? aiStyle.bg : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-300" size={20} />
              <h3 className="font-bold text-lg">Trợ lý Tài chính AI</h3>
            </div>
            <button 
              onClick={handleAskAI}
              disabled={isLoadingAI}
              className="bg-white/20 hover:bg-white/30 transition text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/30 flex items-center gap-2"
            >
              {isLoadingAI ? <Loader2 className="animate-spin" size={14} /> : (aiInsight ? 'Phân tích lại' : 'Phân tích')}
            </button>
          </div>
          
          {aiInsight ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 animate-in slide-in-from-bottom-2">
              <div className="flex items-start gap-3">
                <div className="mt-1">{aiStyle.icon}</div>
                <div>
                    <h4 className="font-bold text-white text-base mb-1">{aiInsight.title}</h4>
                    <p className="text-white/90 text-sm leading-relaxed mb-3">{aiInsight.message}</p>
                    <div className="bg-white/20 rounded-lg p-2 px-3 inline-block">
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wide mr-2">Gợi ý:</span>
                        <span className="text-xs font-medium text-white">{aiInsight.actionItem}</span>
                    </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white/80 text-sm">
              Nhấn "Phân tích" để nhận đánh giá chi tiêu và lời khuyên tiết kiệm từ Gemini.
            </p>
          )}
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Expense Chart */}
      {expenseByCategory.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Phân bổ chi tiêu</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, settings.currency)}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {expenseByCategory.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(entry.name) }}></div>
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          <AlertCircle className="mx-auto mb-2 opacity-50" />
          <p>Chưa có chi tiêu trong tháng này</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;