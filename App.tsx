
import React, { useState, useEffect } from 'react';
import { ShoppingItem, ItemStatus, UserPreferences } from './types';
import Dashboard from './components/Dashboard';
import ShoppingList from './components/ShoppingList';
import MonthlyReports from './components/MonthlyReports';
import HistoryLog from './components/HistoryLog';
import Onboarding from './components/Onboarding';
import { 
  ShoppingBag, 
  BarChart3, 
  History, 
  LayoutDashboard,
  Plus,
  Users,
  Check
} from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shopping-items');
    return saved ? JSON.parse(saved) : [];
  });

  const [prefs, setPrefs] = useState<UserPreferences | null>(() => {
    const saved = localStorage.getItem('user-prefs');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'reports' | 'history'>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('onboarding-done'));
  const [syncRequest, setSyncRequest] = useState<{items: ShoppingItem[], prefs: UserPreferences} | null>(null);

  useEffect(() => {
    localStorage.setItem('shopping-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (prefs) {
      localStorage.setItem('user-prefs', JSON.stringify(prefs));
    }
  }, [prefs]);

  // Check for sync data in URL on mount - Fixed for Hebrew/Unicode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const syncData = urlParams.get('sync');
    if (syncData) {
      try {
        // Correct way to decode Base64 with Unicode/Hebrew support
        const decodedString = decodeURIComponent(escape(atob(syncData)));
        const decoded = JSON.parse(decodedString);
        if (decoded.items && decoded.prefs) {
          setSyncRequest(decoded);
        }
      } catch (e) {
        console.error("Failed to decode sync data", e);
        // Clear broken sync param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleConfirmSync = () => {
    if (syncRequest) {
      // Merge items: keep existing but add new ones from partner
      const existingIds = new Set(items.map(i => i.id));
      const newItems = syncRequest.items.filter(i => !existingIds.has(i.id));
      
      setItems(prev => [...newItems, ...prev]);
      
      // Update prefs
      setPrefs(syncRequest.prefs);
      
      // Clean up URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      setSyncRequest(null);
      alert(`מעולה! עכשיו את/ה מסונכרן/ת עם הרשימה של ${syncRequest.prefs.name}`);
    }
  };

  const handleCancelSync = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setSyncRequest(null);
  };

  const addItem = (item: ShoppingItem) => {
    setItems(prev => [item, ...prev]);
  };

  const updateItemStatus = (id: string, status: ItemStatus) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={(newPrefs) => {
          setPrefs(newPrefs);
          setShowOnboarding(false);
          localStorage.setItem('onboarding-done', 'true');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Sync Confirmation Modal */}
      {syncRequest && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800">הזמנה לסנכרון!</h2>
            <p className="text-slate-500 text-center mt-2 text-sm">
              קיבלת הזמנה להצטרף לבית של <span className="font-bold text-indigo-600">{syncRequest.prefs.name}</span>.
              האם ברצונך למזג את רשימות הקניות שלכם?
            </p>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={handleCancelSync}
                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
              >
                ביטול
              </button>
              <button 
                onClick={handleConfirmSync}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                אשר וסנכרן
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 flex justify-between items-center shadow-sm">
        <div className="overflow-hidden">
          <h1 className="text-xl font-bold text-slate-800 truncate">הבית של {prefs?.name} ו{prefs?.partnerName}</h1>
          <p className="text-xs text-slate-500">ניהול קניות משותף</p>
        </div>
        <button 
          onClick={() => setActiveTab('list')}
          className="bg-indigo-600 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform flex-shrink-0"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        {activeTab === 'dashboard' && <Dashboard items={items} prefs={prefs} />}
        {activeTab === 'list' && (
          <ShoppingList 
            items={items.filter(i => i.status === ItemStatus.ACTIVE)} 
            onAddItem={addItem}
            onUpdateStatus={updateItemStatus}
            onRemove={removeItem}
          />
        )}
        {activeTab === 'reports' && <MonthlyReports items={items} />}
        {activeTab === 'history' && (
          <HistoryLog 
            items={items.filter(i => i.status !== ItemStatus.ACTIVE)} 
            onUpdateStatus={updateItemStatus}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard size={20} />} 
          label="ראשי" 
        />
        <NavButton 
          active={activeTab === 'list'} 
          onClick={() => setActiveTab('list')} 
          icon={<ShoppingBag size={20} />} 
          label="רשימה" 
        />
        <NavButton 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')} 
          icon={<BarChart3 size={20} />} 
          label="דוחות" 
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<History size={20} />} 
          label="יומן" 
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;
