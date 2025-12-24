
import React from 'react';
import { ShoppingItem, ItemStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Download, FileText } from 'lucide-react';

interface Props {
  items: ShoppingItem[];
}

const MonthlyReports: React.FC<Props> = ({ items }) => {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyItems = items.filter(item => item.createdAt.startsWith(currentMonth));
  const boughtItems = monthlyItems.filter(i => i.status === ItemStatus.BOUGHT);

  // Category breakdown
  const categoryData = boughtItems.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.category);
    if (existing) {
      existing.value += curr.price;
    } else {
      acc.push({ name: curr.category, value: curr.price });
    }
    return acc;
  }, []);

  // Daily spend for bar chart
  const dailyData = boughtItems.reduce((acc: any[], curr) => {
    const day = new Date(curr.createdAt).getDate();
    const existing = acc.find(a => a.day === day);
    if (existing) {
      existing.amount += curr.price;
    } else {
      acc.push({ day, amount: curr.price });
    }
    return acc;
  }, []).sort((a, b) => a.day - b.day);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-800">דוח הוצאות חודשי</h2>
        <button className="flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
          <Download size={16} />
          PDF
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase">חלוקה לפי קטגוריות</h3>
        <div className="h-[250px] w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} ₪`, 'סכום']}
                  contentStyle={{ direction: 'rtl', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">אין מספיק נתונים להצגת גרף</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {categoryData.map((cat, idx) => (
            <div key={cat.name} className="flex items-center gap-2 text-xs text-slate-600">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
              <span>{cat.name}:</span>
              <span className="font-bold">{cat.value} ₪</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase">הוצאה יומית (ש״ח)</h3>
        <div className="h-[200px] w-full">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: '#f1f5f9' }}
                   contentStyle={{ direction: 'rtl', borderRadius: '12px' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">אין רכישות החודש</div>
          )}
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-4">
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 text-sm">סיכום ביצועים</h4>
          <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
            החודש רכשתם {boughtItems.length} מוצרים. קטגוריית <strong>"{categoryData.sort((a,b)=>b.value-a.value)[0]?.name || 'כללי'}"</strong> היא ההוצאה הגדולה ביותר שלכם.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReports;
