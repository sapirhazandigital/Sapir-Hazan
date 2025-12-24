
import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { UserCheck, Sparkles, MessageSquare, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete: (prefs: UserPreferences) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [budgetGoal, setBudgetGoal] = useState('');

  const suggestions = [
    { title: "סיווג חכם", desc: "השתמשו ב-AI כדי לקטלג מוצרים באופן אוטומטי ולראות לאן הולך הכסף." },
    { title: "סנכרון בזמן אמת", desc: "האפליקציה תעדכן את הרשימה אצל שניכם ברגע שמישהו מוסיף פריט." },
    { title: "ניהול תקציב", desc: "הגדרת יעד חודשי כדי לוודא שלא חורגים מהתכנון המקורי." }
  ];

  const handleFinish = () => {
    onComplete({
      name: name || 'משתמש',
      partnerName: partnerName || 'בן/בת הזוג',
      budgetGoal: parseInt(budgetGoal) || 2000
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">קודם כל, בואו נכיר</h1>
              <p className="text-slate-500 mt-2">כדי שהחוויה תהיה אישית, אשמח לכמה פרטים</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">מה שמך?</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: יעל"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ומה שם בן/בת הזוג?</label>
                <input 
                  type="text" 
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="למשל: דני"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">תקציב קניות חודשי רצוי (ש״ח)</label>
                <input 
                  type="number" 
                  value={budgetGoal}
                  onChange={(e) => setBudgetGoal(e.target.value)}
                  placeholder="למשל: 3000"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-left duration-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">הצעות לייעול המערכת</h1>
              <p className="text-slate-500 mt-2">הנה כמה תוספות שתכננתי במיוחד בשבילכם</p>
            </div>
            <div className="space-y-4">
              {suggestions.map((s, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                    <CheckCircle2 className="text-green-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{s.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl text-xs text-indigo-700 leading-relaxed border border-indigo-100">
              <strong>טיפ:</strong> בסוף כל חודש המערכת תפיק דוח אוטומטי עם תובנות על הרגלי הצריכה שלכם ותציע איך לחסוך לפחות 10% בעזרת קניות מרוכזות.
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="flex-1 p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <ArrowRight size={20} />
            חזרה
          </button>
        )}
        <button 
          onClick={step === 2 ? handleFinish : () => setStep(step + 1)}
          disabled={step === 1 && (!name || !partnerName)}
          className="flex-[2] p-4 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:bg-slate-300 transition-colors"
        >
          {step === 2 ? 'בואו נתחיל!' : 'המשך'}
          {step === 2 ? <UserCheck size={20} /> : <ArrowLeft size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
