import React, { useState } from 'react';
import { Wallet, Plus, Trash2, ChevronLeft, Landmark } from 'lucide-react';

const AccountsView = ({ setView, accounts, addAccount, deleteAccount }) => {
  const [newName, setNewName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName) return;
    addAccount(newName, parseFloat(initialBalance) || 0);
    setNewName('');
    setInitialBalance('');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => setView('dashboard')} className="p-3 bg-white rounded-2xl shadow-sm border border-amber-50 text-amber-600 hover:bg-amber-50 transition-all">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-black text-gray-800">Bank Accounts</h2>
        <div className="w-12"></div>
      </header>

      <section className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-amber-50">
        <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4">Add New Bank/Cash</h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Account Name (e.g. HBL, Cash)" 
            className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Initial Balance" 
            className="w-full sm:w-40 bg-gray-50 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
          />
          <button type="submit" className="bg-amber-500 text-white p-4 rounded-2xl shadow-lg hover:bg-amber-600 transition-all">
            <Plus size={24} strokeWidth={3} />
          </button>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-6 rounded-[2rem] border border-amber-50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                <Landmark size={20} />
              </div>
              <button onClick={() => deleteAccount(acc.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
            <p className="font-black text-gray-500 uppercase text-[10px] tracking-widest">Balance</p>
            <h4 className="text-2xl font-black text-gray-800 mb-1">{acc.name}</h4>
            <p className="text-xl font-black text-amber-600">${parseFloat(acc.balance).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountsView;