import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Modular Imports
import Header from './components/Common/Header';
import AuthView from './features/auth/AuthView';
import AccountsView from './features/accounts/components/AccountsView';
import CategoriesView from './features/categories/components/CategoriesView';
import DashboardView from './features/dashboard/DashboardView';
import DeleteModal from './components/Common/DeleteModal';
import { isLiability, AccountType } from './types/AccountProps';
import { User, Account, Category, Record, DateRange, DeleteModalProps } from './types';

interface DeleteConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const App: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [supabaseLibLoaded, setSupabaseLibLoaded] = useState<boolean>(false);
  const [view, setView] = useState<string>(localStorage.getItem('currentView') || 'dashboard');
  const [loading, setLoading] = useState<boolean>(false);

  // Global Sync State (Needed for the Dashboard & Record Form)
  const [records, setRecords] = useState<Record[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'expense' | 'earning'>('expense');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [deleteConfig, setDeleteConfig] = useState<DeleteConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const requestDelete = (title: string, message: string, action: () => void) => {
    setDeleteConfig({
      isOpen: true,
      title,
      message,
      onConfirm: action
    });
  };

  // --- Supabase Init ---
  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  useEffect(() => {
    if ((window as any).supabase) { setSupabaseLibLoaded(true); }
    else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => setSupabaseLibLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  const supabase = useMemo(() => {
    if (!supabaseLibLoaded || !(window as any).supabase) return null;
    return (window as any).supabase.createClient((import.meta as any).env.VITE_SUPABASE_URL, (import.meta as any).env.VITE_SUPABASE_ANON_KEY);
  }, [supabaseLibLoaded]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") setView('update-password');
      if (event === "SIGNED_OUT") { setView('dashboard'); localStorage.removeItem('currentView'); }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const resetForm = () => {
    setEditingId(null);
    setAmount('');
    setNote('');
    if (accounts.length > 0) setSelectedAccountId(accounts[0].id);
  };

  // --- Core Data Action ---
  const fetchData = async (): Promise<void> => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const [recRes, catRes, accRes] = await Promise.all([
        supabase.from('records').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('accounts').select('*').order('name', { ascending: true })
      ]);
      console.log("Fetched Records:", recRes);
      setRecords(recRes.data || []);
      setAccounts(accRes.data || []);
      if (accRes.data?.length > 0 && !selectedAccountId) setSelectedAccountId(accRes.data[0].id);
      if (catRes.data) {
        setExpenseCategories(catRes.data.filter((c: Category) => c.type === 'expense'));
        setIncomeCategories(catRes.data.filter((c: Category) => c.type === 'earning'));
        if (!activeCategory && catRes.data.length > 0) setActiveCategory(catRes.data[0].name);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const deleteRecord = async (id: string): Promise<void> => {
    if (window.confirm("Confirm deletion?")) {
      await supabase.from('records').delete().eq('id', id);
      fetchData();
    }
  };

  const handleSaveRecord = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) e.preventDefault();

    if (isSubmitting || !amount || !selectedAccountId) return;

    const numAmount = parseFloat(amount);
    const account = accounts.find(a => a.id === selectedAccountId);
    if (!account) return;

    const isLiability = ['credit', 'payable'].includes(account.type);
    let newBalance = parseFloat(account.balance);

    if (isLiability) {
      newBalance = type === 'expense' ? newBalance + numAmount : newBalance - numAmount;
    } else {
      newBalance = type === 'expense' ? newBalance - numAmount : newBalance + numAmount;
    }

    setIsSubmitting(true);
    try {
      const recordData = {
        amount: numAmount,
        type,
        category: activeCategory,
        account_id: selectedAccountId,
        note,
        user_id: user!.id
      };

      const { error: recordError } = await supabase.from('records').insert([recordData]);
      if (recordError) throw recordError;

      const { error: accountError } = await supabase.from('accounts')
        .update({ balance: newBalance })
        .eq('id', selectedAccountId);
      if (accountError) throw accountError;

      await fetchData();

      setAmount('');
      setNote('');
      if (typeof resetForm === 'function') resetForm();

    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (record: Record) => {
    setEditingId(record.id); setAmount(record.amount.toString()); setType(record.type);
    setActiveCategory(record.category); setSelectedAccountId(record.account_id); setNote(record.note || '');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Analytics Memo ---
  const analytics = useMemo(() => {
    const filtered = records.filter(r => {
      const d = new Date(r.created_at).toISOString().split('T')[0];
      return d >= dateRange.start && d <= dateRange.end;
    });
    const totals = filtered.reduce((acc, curr) => {
      curr.type === 'earning' ? acc.income += curr.amount : acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
    const spending: { [key: string]: number } = records.reduce((acc, curr) => {
      if (curr.type === 'expense') acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as { [key: string]: number });
    return { totals, spending };
  }, [records, dateRange]);

  const totalBalance = accounts.reduce((sum, acc) => {
    const bal = parseFloat(acc.balance) || 0;
    return isLiability(acc.type as AccountType) ? sum - bal : sum + bal;
  }, 0);

  if (!supabaseLibLoaded) return <div className="min-h-screen bg-[#FFFBF4] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" /></div>;

  return (
    <div className="min-h-screen bg-[#FFFBF4] text-gray-800 font-sans pb-20">
      {user && <Header view={view} setView={setView} onLogout={() => supabase.auth.signOut()} />}

      <main className="max-w-7xl mx-auto px-6">
        {!user ? (
          <AuthView supabase={supabase} />
        ) : (
          <>
            {view === 'accounts' ? (
              <AccountsView
                setView={setView}
                supabase={supabase}
                user={user}
                requestDelete={requestDelete} />
            ) : view === 'categories' ? (
              <CategoriesView
                supabase={supabase}
                user={user}
                setView={setView}
                requestDelete={requestDelete} // <--- YOU ARE LIKELY MISSING THIS LINE
              />
            ) : (
              <DashboardView
                analytics={analytics}
                totalBalance={totalBalance}
                accounts={accounts}
                records={records}
                dateRange={dateRange}
                setDateRange={setDateRange}
                type={type}
                setType={setType}
                amount={amount}
                setAmount={setAmount}
                selectedAccountId={selectedAccountId}
                setSelectedAccountId={setSelectedAccountId}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                note={note}
                setNote={setNote}
                editingId={editingId}
                setEditingId={setEditingId}
                handleSaveRecord={handleSaveRecord}
                startEdit={startEdit}
                deleteRecord={deleteRecord}
                expenseCategories={expenseCategories}
                incomeCategories={incomeCategories}
                formRef={formRef as React.RefObject<HTMLFormElement>}
              />
            )}
          </>
        )}
      </main>
      {/* Delete Confirmation Modal */}
      <DeleteModal
        {...deleteConfig}
        onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
      />
    </div>
  );
};

export default App;