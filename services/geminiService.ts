import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category, TransactionType } from "../types";

export interface AIAnalysisResult {
  sentiment: 'GOOD' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  actionItem: string;
}

// Helper to sanitize data for the prompt
const prepareDataForAI = (transactions: Transaction[], categories: Category[]) => {
  // Get current month transactions
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const summary = monthlyTransactions.reduce((acc, t) => {
    const cat = categories.find(c => c.id === t.categoryId)?.name || 'Khác';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += t.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalIncome: monthlyTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0),
    totalExpense: monthlyTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0),
    breakdown: summary,
    count: monthlyTransactions.length
  };
};

export const analyzeFinances = async (transactions: Transaction[], categories: Category[]): Promise<AIAnalysisResult | null> => {
  // IMPORTANT: In a real production app, never expose API keys on the client.
  const apiKey = process.env.API_KEY; 
  
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }

  const data = prepareDataForAI(transactions, categories);
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Bạn là một chuyên gia tài chính cá nhân. Hãy phân tích dữ liệu chi tiêu tháng này (Đơn vị: VND) và đưa ra lời khuyên bằng tiếng Việt.
    
    Dữ liệu:
    ${JSON.stringify(data)}

    Yêu cầu output JSON với schema:
    - sentiment: "GOOD" (nếu chi tiêu hợp lý, tiết kiệm tốt), "WARNING" (nếu có dấu hiệu chi tiêu quá tay ở một số mục), "CRITICAL" (nếu chi tiêu vượt thu hoặc báo động đỏ).
    - title: Tiêu đề ngắn gọn (dưới 10 từ).
    - message: Nhận xét chi tiết (dưới 50 từ).
    - actionItem: 1 hành động cụ thể nên làm ngay.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ['GOOD', 'WARNING', 'CRITICAL'] },
            title: { type: Type.STRING },
            message: { type: Type.STRING },
            actionItem: { type: Type.STRING },
          },
          required: ['sentiment', 'title', 'message', 'actionItem'],
        },
      },
    });
    
    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};