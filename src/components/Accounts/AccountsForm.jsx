import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AccountForm = ({ onAdd, onEdit, editingAccount, setEditingAccount }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setBalance(editingAccount.balance.toString());
    } else {
      setName(''); setBalance('');
    }
  }, [editingAccount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingAccount) {
      onEdit(editingAccount.id, { name: name.trim(), balance: parseFloat(balance) || 0 });
    } else {
      onAdd(name.trim(), parseFloat(balance) || 0);
    }
  };

  return (
    <section className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-amber-50 relative">
      {editingAccount && (
        <button onClick={() => setEditingAccount(null)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full"><X size={16} /></button>
      )}
      <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4">
        {editingAccount ? 'Update Account' : 'New Account'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <input type="text" placeholder="Account Name" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500" />
        <input type="number" placeholder="Initial Balance" value={balance} onChange={e => setBalance(e.target.value)} className="bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500" />
      </div>
      <button onClick={handleSubmit} className={`w-full py-4 rounded-2xl font-black shadow-lg text-white transition-all ${editingAccount ? 'bg-blue-600' : 'bg-amber-500'}`}>
        {editingAccount ? 'Save Changes' : 'Create Account'}
      </button>
    </section>
  );
};

export default AccountForm;