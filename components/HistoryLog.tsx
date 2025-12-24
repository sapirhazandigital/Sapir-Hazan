
import React, { useState } from 'react';
import { ShoppingItem, ItemStatus } from '../types';
import { Search, Calendar, Filter } from 'lucide-react';

interface Props {
  items: ShoppingItem[];
  onUpdateStatus: (id: string, status: ItemStatus) => void;
}

const HistoryLog: React.FC<Props> = ({ items, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | ItemStatus.BOUGHT | ItemStatus.CANCELED>('ALL');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Group items by month - explicitly type the reduce generic to ensure Object.entries infers monthItems correctly
  const grouped = filteredItems.reduce<Record<string, ShoppingItem[]>>((acc, curr) => {
    const month = new Date(curr.createdAt).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="sticky top-[72px] z-40 bg-slate-50/90 backdrop-blur-md pb-4 pt-2">
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="חיפוש בהיסטוריה..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="הכל" />
          <FilterButton active={filter === ItemStatus.BOUGHT} onClick={() => setFilter(ItemStatus.BOUGHT)} label="נקנו" />
          <FilterButton active={filter === ItemStatus.CANCELED} onClick={() => setFilter(ItemStatus.CANCELED)} label="בוטלו" />
        </div>
      </div>

      <div className="space-y-8">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic">לא נמצאו פריטים תואמים</div>
        ) : (
          Object.entries(grouped).map(([month, monthItems]) => (
            <div key={month} className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400 px-1">
                <Calendar size={14} />
                <h3 className="text-xs font-bold uppercase tracking-wider">{month}</h3>
              </div>
              <div className="space-y-2">
                {/* Fixed: monthItems is now correctly typed as ShoppingItem[] because grouped is Record<string, ShoppingItem[]> */}
                {monthItems.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className={`text-sm font-semibold ${item.status === ItemStatus.CANCELED ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString('he-IL')}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          item.status === ItemStatus.BOUGHT ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {item.status === ItemStatus.BOUGHT ? 'נקנה' : 'בוטל'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {item.price > 0 ? `${item.price} ₪` : '-'}
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

const FilterButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
      active ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'
    }`}
  >
    {label}
  </button>
);

export default HistoryLog;
