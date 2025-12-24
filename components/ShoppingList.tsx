
import React, { useState } from 'react';
import { ShoppingItem, ItemStatus } from '../types';
import { getSmartCategorization, identifyProductByBarcode } from '../services/geminiService';
import BarcodeScanner from './BarcodeScanner';
import { Check, X, Trash2, Plus, Sparkles, ShoppingBag, Barcode } from 'lucide-react';

interface Props {
  items: ShoppingItem[];
  onAddItem: (item: ShoppingItem) => void;
  onUpdateStatus: (id: string, status: ItemStatus) => void;
  onRemove: (id: string) => void;
}

const ShoppingList: React.FC<Props> = ({ items, onAddItem, onUpdateStatus, onRemove }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleAdd = async (e?: React.FormEvent, nameOverride?: string, categoryOverride?: string) => {
    if (e) e.preventDefault();
    const name = nameOverride || newItemName;
    if (!name.trim()) return;

    setLoading(true);
    let category = categoryOverride;
    
    if (!category) {
        category = await getSmartCategorization(name);
    }
    
    const newItem: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      price: parseFloat(newItemPrice) || 0,
      quantity: 1,
      category: category || "כללי",
      status: ItemStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddItem(newItem);
    setNewItemName('');
    setNewItemPrice('');
    setLoading(false);
    setIsAdding(false);
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setLoading(true);
    
    // Use Gemini to identify product from barcode
    const product = await identifyProductByBarcode(barcode);
    
    // Add directly to list
    await handleAdd(undefined, product.name, product.category);
  };

  return (
    <div className="space-y-6">
      {showScanner && (
        <BarcodeScanner 
            onScan={handleBarcodeScan} 
            onClose={() => setShowScanner(false)} 
        />
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-full flex items-center justify-between text-slate-700 font-semibold"
        >
          <span>הוספת מוצר חדש</span>
          <Plus size={20} className={`transform transition-transform ${isAdding ? 'rotate-45' : ''}`} />
        </button>

        {isAdding && (
          <form onSubmit={(e) => handleAdd(e)} className="mt-4 space-y-3">
            <div className="flex gap-2">
                <input 
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="מה צריך לקנות?"
                  className="flex-1 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
                <button 
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                    title="סרוק ברקוד"
                >
                    <Barcode size={24} />
                </button>
            </div>
            <div className="flex gap-2">
              <input 
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="מחיר משוער (ש״ח)"
                className="flex-1 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 rounded-xl font-bold flex items-center gap-2 disabled:bg-slate-300"
              >
                {loading ? 'מעבד...' : 'הוסף'}
                {!loading && <Plus size={18} />}
              </button>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-indigo-500 text-xs animate-pulse">
                <Sparkles size={14} />
                <span>Gemini מנתח את המוצר...</span>
              </div>
            )}
          </form>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 px-1 uppercase tracking-wider">רשימה נוכחית ({items.length})</h2>
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <ShoppingBag className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-400">אין מוצרים ברשימה. הגיע הזמן לקניות!</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{item.name}</h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{item.price > 0 ? `${item.price} ₪` : 'ללא מחיר'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onUpdateStatus(item.id, ItemStatus.BOUGHT)}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="נקנה"
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={() => onUpdateStatus(item.id, ItemStatus.CANCELED)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="בוטל"
                >
                  <X size={18} />
                </button>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="מחק"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
