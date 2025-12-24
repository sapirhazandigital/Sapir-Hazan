
import React, { useState } from 'react';
import { ShoppingItem, ItemStatus, UserPreferences } from '../types';
import { Wallet, TrendingDown, Package, ShieldCheck, Share2, Copy, CheckCircle } from 'lucide-react';

interface Props {
  items: ShoppingItem[];
  prefs: UserPreferences | null;
}

const Dashboard: React.FC<Props> = ({ items, prefs }) => {
  const [copied, setCopied] = useState(false);
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  const monthlyItems = items.filter(item => item.createdAt.startsWith(currentMonth));
  const activeItems = items.filter(item => item.status === ItemStatus.ACTIVE);
  const totalSpent = monthlyItems
    .filter(item => item.status === ItemStatus.BOUGHT)
    .reduce((acc, curr) => acc + curr.price, 0);

  const budgetProgress = prefs?.budgetGoal ? (totalSpent / prefs.budgetGoal) * 100 : 0;

  const generateSyncLink = () => {
    const data = {
      items: items,
      prefs: prefs
    };
    
    try {
        // Correct way to encode Unicode/Hebrew to Base64
        const jsonString = JSON.stringify(data);
        const encoded = btoa(unescape(encodeURIComponent(jsonString)));
        const url = `${window.location.origin}${window.location.pathname}?sync=${encoded}`;
        
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        });
    } catch (err) {
        console.error("Failed to generate sync link", err);
        alert("חלה שגיאה ביצירת הקישור. נסו שוב.");
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-indigo-100 text-sm">הוצאות החודש ({new Date().toLocaleString('he-IL', { month: 'long' })})</p>
            <h2 className="text-4xl font-bold mt-1">{totalSpent.toLocaleString()} ₪</h2>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Wallet size={24} />
          </div>
        </div>
        
        {prefs?.budgetGoal && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>תקציב: {prefs.budgetGoal} ₪</span>
              <span>{Math.round(budgetProgress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${budgetProgress > 90 ? 'bg-red-400' : 'bg-green-400'}`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Sync / Invite Partner Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm overflow-hidden relative group">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Share2 size={18} className="text-indigo-600" />
                    סנכרון עם {prefs?.partnerName || 'בן/בת הזוג'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                    שלחו את הקישור הייחודי כדי ששניכם תוכלו לנהל את הרשימה ביחד.
                </p>
            </div>
        </div>
        <button 
          onClick={generateSyncLink}
          className={`w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            copied 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle size={18} />
              הקישור הועתק!
            </>
          ) : (
            <>
              <Copy size={18} />
              העתק קישור להזמנה
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Package className="text-blue-500" />} 
          label="מוצרים לרכישה" 
          value={activeItems.length.toString()} 
          color="bg-blue-50"
        />
        <StatCard 
          icon={<TrendingDown className="text-red-500" />} 
          label="מוצרים שבוטלו" 
          value={monthlyItems.filter(i => i.status === ItemStatus.CANCELED).length.toString()} 
          color="bg-red-50"
        />
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-indigo-500" />
          סטטוס סנכרון
        </h3>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            {prefs?.partnerName ? prefs.partnerName[0] : '?'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">{prefs?.partnerName || 'בן/בת הזוג'} מחובר/ת</p>
            <p className="text-[10px] text-slate-400">עודכן לפני זמן קצר</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className={`p-4 rounded-2xl ${color} border border-white/50 shadow-sm`}>
    <div className="mb-2">{icon}</div>
    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{label}</p>
    <p className="text-xl font-bold text-slate-800">{value}</p>
  </div>
);

export default Dashboard;
