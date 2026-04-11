import React from 'react';
import { ChevronLeft, Trash2, Edit2, Wallet } from 'lucide-react';
import { useAccounts } from '../../hooks/useAccounts';
import AccountsForm from './AccountsForm';

const AccountsView = ({ setView, supabase, user }) => {
  const { accounts, editingAccount, setEditingAccount, addAccount, editAccount, removeAccount } = useAccounts(supabase, user);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <header className="flex items-center justify-between">
        <button onClick={() => setView('dashboard')} className="p-3 bg-white rounded-2xl border border-amber-50 text-amber-600"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-black text-gray-800">My Wallets</h2>
        <div className="w-12"></div>
      </header>

      <AccountsForm onAdd={addAccount} onEdit={editAccount} editingAccount={editingAccount} setEditingAccount={setEditingAccount} />

      <div className="grid grid-cols-1 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-5 rounded-[1.8rem] flex items-center justify-between border border-amber-50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Wallet size={20} /></div>
              <div>
                <p className="font-black text-gray-800">{acc.name}</p>
                <p className="text-xs font-bold text-gray-400">${parseFloat(acc.balance).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingAccount(acc)} className="p-2 text-gray-300 hover:text-amber-500"><Edit2 size={18} /></button>
              <button onClick={() => removeAccount(acc.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountsView;