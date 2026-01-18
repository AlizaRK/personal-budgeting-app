import React from 'react';
import { ChevronLeft, ArrowDownCircle, ArrowUpCircle, Target, Trash2 } from 'lucide-react';

const CategoriesView = ({ 
  setView, 
  expenseCategories, 
  incomeCategories, 
  addCategory, 
  removeCategory, 
  newCatName, 
  setNewCatName, 
  newCatTarget, 
  setNewCatTarget, 
  newCatType, 
  setNewCatType 
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <header className="flex items-center justify-between mb-8">
      <button onClick={() => setView('dashboard')} className="p-3 bg-white rounded-2xl shadow-sm border border-amber-50 text-amber-600 hover:bg-amber-50 transition-all">
        <ChevronLeft size={24} strokeWidth={3} />
      </button>
      <h2 className="text-xl font-black text-gray-800">Manage Categories</h2>
      <div className="w-12"></div>
    </header>

    <section className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-amber-50">
      <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4">Add Category</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <input type="text" placeholder="Name" className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
        <input type="number" placeholder="Monthly Target $" className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500" value={newCatTarget} onChange={e => setNewCatTarget(e.target.value)} />
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setNewCatType('expense')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${newCatType === 'expense' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>EXPENSE</button>
        <button onClick={() => setNewCatType('earning')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${newCatType === 'earning' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>INCOME</button>
      </div>
      <button onClick={addCategory} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg hover:bg-amber-600 transition-all">Create Category</button>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className="font-black text-orange-600 flex items-center gap-2 px-2"><ArrowDownCircle size={18}/> Expenses</h4>
        {expenseCategories.map(cat => (
          <div key={cat.id} className="bg-white p-5 rounded-[1.8rem] flex items-center justify-between border border-amber-50 shadow-sm">
            <div>
              <p className="font-black text-gray-800">{cat.name}</p>
              {cat.target > 0 && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><Target size={10}/> Target: ${cat.target}/mo</p>}
            </div>
            <button onClick={() => removeCategory(cat.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h4 className="font-black text-emerald-600 flex items-center gap-2 px-2"><ArrowUpCircle size={18}/> Income</h4>
        {incomeCategories.map(cat => (
          <div key={cat.id} className="bg-white p-5 rounded-[1.8rem] flex items-center justify-between border border-amber-50 shadow-sm">
            <p className="font-black text-gray-800">{cat.name}</p>
            <button onClick={() => removeCategory(cat.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CategoriesView;