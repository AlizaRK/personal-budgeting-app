import React, { useState, useEffect, useMemo, useRef } from 'react';

// Modular Imports
import Header from './components/Header';
import AuthView from './components/AuthView';
import AccountsView from './components/Accounts/AccountsView';
import CategoriesView from "./components/Categories/CategoriesView";
import DashboardView from './components/DashboardView';
import DeleteModal from './components/Common/DeleteModal';
import { isLiability, AccountTypes } from './constants/accountTypes';

const App = () => {
  const formRef = useRef(null);
  const [user, setUser] = useState(null);
  const [supabaseLibLoaded, setSupabaseLibLoaded] = useState(false);
  const [view, setView] = useState(localStorage.getItem('currentView') || 'dashboard');
  const [loading, setLoading] = useState(false);

  // Global Sync State (Needed for the Dashboard & Record Form)
  const [records, setRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const requestDelete = (title, message, action) => {
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
    if (window.supabase) { setSupabaseLibLoaded(true); }
    else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => setSupabaseLibLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  const supabase = useMemo(() => {
    if (!supabaseLibLoaded || !window.supabase) return null;
    return window.supabase.createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
  }, [supabaseLibLoaded]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
  const fetchData = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const [recRes, catRes, accRes] = await Promise.all([
        supabase.from('records').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('accounts').select('*').order('name', { ascending: true })
      ]);
      setRecords(recRes.data || []);
      setAccounts(accRes.data || []);
      if (accRes.data?.length > 0 && !selectedAccountId) setSelectedAccountId(accRes.data[0].id);
      if (catRes.data) {
        setExpenseCategories(catRes.data.filter(c => c.type === 'expense'));
        setIncomeCategories(catRes.data.filter(c => c.type === 'earning'));
        if (!activeCategory && catRes.data.length > 0) setActiveCategory(catRes.data[0].name);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  // --- Record Handlers ---

  const deleteRecord = async (id) => {
    if (window.confirm("Confirm deletion?")) {
      await supabase.from('records').delete().eq('id', id);
      fetchData();
    }
  };

  const handleSaveRecord = async (e) => {
    if (e) e.preventDefault();
    if (!amount || !selectedAccountId) return;

    const numAmount = parseFloat(amount);
    const account = accounts.find(a => a.id === selectedAccountId);
    const isLiability = ['credit', 'payable'].includes(account.type);

    let newBalance = parseFloat(account.balance);

    if (isLiability(account.type)) {
      newBalance = type === 'expense' ? newBalance + numAmount : newBalance - numAmount;
    } else {
      newBalance = type === 'expense' ? newBalance - numAmount : newBalance + numAmount;
    }

    setLoading(true);
    try {
      const recordData = {
        amount: numAmount, type, category: activeCategory,
        account_id: selectedAccountId, note, user_id: user.id
      };

      await supabase.from('records').insert([recordData]);

      await supabase.from('accounts').update({ balance: newBalance }).eq('id', selectedAccountId);

      setAmount('');
      setNote('');
      fetchData();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (record) => {
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
    const spending = records.reduce((acc, curr) => {
      if (curr.type === 'expense') acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    return { totals, spending };
  }, [records, dateRange]);

  const totalBalance = accounts.reduce((sum, acc) => {
    const bal = parseFloat(acc.balance) || 0;
    return isLiability(acc.type) ? sum - bal : sum + bal;
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
                setView={setView} accounts={accounts}
                fetchData={fetchData}
                supabase={supabase}
                user={user}
                requestDelete={requestDelete} />
            ) : view === 'categories' ? (
              <CategoriesView setView={setView} supabase={supabase} user={user} />
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
                formRef={formRef}
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