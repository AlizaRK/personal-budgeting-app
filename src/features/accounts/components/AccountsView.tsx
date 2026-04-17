import React from 'react';
import { ChevronLeft, Trash2, Edit2, Wallet, CreditCard, Users, TrendingUp } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import AccountsForm from './AccountsForm';
import { AccountTypes, Account, AccountData } from '../../../types/AccountProps';

const AccountsView: React.FC<{ setView: (view: string) => void; supabase: any; user: any; requestDelete: (title: string, message: string, onConfirm: () => void) => void; }> = ({ setView, supabase, user, requestDelete }) => {
  const { accounts, editingAccount, setEditingAccount, addAccount, editAccount, removeAccount } = useAccounts(supabase, user) as { accounts: Account[]; editingAccount: Account | null; setEditingAccount: (account: Account | null) => void; addAccount: (accountData: AccountData) => void; editAccount: (id: string, accountData: AccountData) => void; removeAccount: (id: string) => void; };

  const handleDelete = (id: string) => {
    requestDelete(
      "Delete Wallet?",
      "This will permanently remove this account and all its transaction history. This cannot be undone.",
      () => removeAccount(id) // Ensure removeAccount is a function that handles the API call
    );
  };

  const getAccountConfig = (type: keyof typeof AccountTypes) => {
    switch (type) {
      case AccountTypes.CREDIT.toUpperCase():
        return { theme: 'bg-purple-50 text-purple-600', icon: CreditCard, label: 'Credit' };
      case AccountTypes.PAYABLE.toUpperCase():
        return { theme: 'bg-red-50 text-red-600', icon: Users, label: 'Payable' };
      case AccountTypes.RECEIVABLE.toUpperCase():
        return { theme: 'bg-blue-50 text-blue-600', icon: TrendingUp, label: 'Owed to Me' };
      default:
        return { theme: 'bg-emerald-50 text-emerald-600', icon: Wallet, label: 'Cash' };
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <header className="flex items-center justify-between">
        <button onClick={() => setView('dashboard')} className="p-3 bg-white rounded-2xl border border-amber-50 text-amber-600 transition-all active:scale-90">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-gray-800">My Wallets</h2>
        <div className="w-12"></div>
      </header>

      <AccountsForm
        onAdd={addAccount}
        onEdit={editAccount}
        editingAccount={editingAccount}
        setEditingAccount={setEditingAccount}
      />

      <div className="grid grid-cols-1 gap-4 pb-10">
        {accounts.map(acc => {
          const config = getAccountConfig(acc.type.toUpperCase() as keyof typeof AccountTypes);
          const Icon = config.icon;

          return (
            <div key={acc.id} className="bg-white p-5 rounded-[2.2rem] flex items-center justify-between border border-amber-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-[1.2rem] ${config.theme}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-800 leading-none">{acc.name}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${config.theme}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-400 mt-1">
                    ${acc.balance}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingAccount(acc)} className="p-3 text-gray-300 hover:text-amber-500 transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(acc.id)} className="p-3 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountsView;