import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Banknote, CreditCard, Users, Check, TrendingUp, LucideIcon } from 'lucide-react';
import { AccountTypes, AccountType } from '../../../types/AccountProps';
import { Account, AccountData } from '../../../types/AccountProps';

interface AccountsFormProps {
  onAdd: (accountData: AccountData) => void;
  onEdit: (id: string, accountData: AccountData) => void;
  editingAccount: Account | null;
  setEditingAccount: (account: Account | null) => void;
}

const AccountsForm: React.FC<AccountsFormProps> = ({ onAdd, onEdit, editingAccount, setEditingAccount }) => {
  const [name, setName] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [type, setType] = useState<AccountType>('cash');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setBalance(editingAccount.balance.toString());
      setType(editingAccount.type || 'cash');
    } else {
      setName('');
      setBalance('');
      setType('cash');
    }
  }, [editingAccount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: Array<{
    value: AccountType;
    label: string;
    icon: LucideIcon;
    desc: string;
    color: string;
  }> = [
    { value: AccountTypes.CASH, label: 'Cash / Bank', icon: Banknote, desc: 'Assets & Savings', color: 'text-emerald-500' },
    { value: AccountTypes.CREDIT, label: 'Credit Card', icon: CreditCard, desc: 'Bank Liabilities', color: 'text-purple-500' },
    { value: AccountTypes.PAYABLE, label: 'Money I Owe', icon: Users, desc: 'Personal Debt', color: 'text-red-500' },
    { value: AccountTypes.RECEIVABLE, label: 'Money Owed to Me', icon: TrendingUp, desc: 'Personal Loans/IOUs', color: 'text-blue-500' },
  ];

  const selectedOption = options.find(opt => opt.value === type);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    const accountData: AccountData = {
      name: name.trim(),
      balance: parseFloat(balance) || 0,
      type: type
    };

    if (editingAccount) {
      onEdit(editingAccount.id, accountData);
    } else {
      onAdd(accountData);
    }

    if (!editingAccount) {
      setName('');
      setBalance('');
      setType('cash');
    }
  };

  return (
    <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50 relative">
      <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-6">
        {editingAccount ? 'Update Wallet' : 'Create New Wallet'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Account Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-400 focus:bg-white transition-all"
          />
          <input
            type="number"
            placeholder="Balance"
            value={balance}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBalance(e.target.value)}
            className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-400 focus:bg-white transition-all"
          />
        </div>

        {/* --- CUSTOM MATERIAL-STYLE DROPDOWN --- */}
        <div className="relative mb-8" ref={menuRef}>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">Wallet Type</label>

          {/* The Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full flex items-center justify-between bg-gray-50 p-4 rounded-2xl font-bold text-gray-700 border-2 border-transparent hover:border-amber-200 transition-all"
          >
            <div className="flex items-center gap-3">
              {selectedOption ? (
                <selectedOption.icon className={selectedOption.color} size={20} />
              ) : (
                <div className="text-gray-400">Select an option</div>
              )}
              <span>{selectedOption ? selectedOption.label : 'Select an option'}</span>
            </div>
            <ChevronDown size={20} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* The Floating Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setType(opt.value); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-4 hover:bg-amber-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl bg-white shadow-sm ${opt.color}`}>
                      <opt.icon size={18} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-800">{opt.label}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{opt.desc}</p>
                    </div>
                  </div>
                  {type === opt.value && <Check size={18} className="text-amber-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-5 rounded-[1.8rem] font-black shadow-lg text-white bg-amber-500 hover:bg-amber-600 transition-all active:scale-95"
        >
          {editingAccount ? 'Save Changes' : 'Initialize Account'}
        </button>
      </form>
    </section>
  );
};

export default AccountsForm;