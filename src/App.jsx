import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PencilLine,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Wallet,
  Tag,
  Trash2,
  Target,
  LogOut,
  TrendingUp,
  Calendar
} from 'lucide-react';

// Modular Imports
import AuthView from './components/AuthView';
import AccountsView from './components/AccountsView';
import CategoriesView from './components/CategoriesView';

const App = () => {
  const formRef = useRef(null);
  
  // Auth & Connection State
  const [user, setUser] = useState(null);
  const [supabaseLibLoaded, setSupabaseLibLoaded] = useState(false);
  const [view, setView] = useState(localStorage.getItem('currentView') || 'dashboard');
  
  // Data State
  const [loading, setLoading] = useState(false);
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

  // Analytics State
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // --- Initialization ---

  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  useEffect(() => {
    if (window.supabase) {
      setSupabaseLibLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => setSupabaseLibLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  const supabase = useMemo(() => {
    if (!supabaseLibLoaded || !window.supabase) return null;
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return (url && key) ? window.supabase.createClient(url, key) : null;
  }, [supabaseLibLoaded]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // --- Data Actions ---

  const fetchData = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const [recRes, catRes, accRes] = await Promise.all([
        supabase.from('records').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('accounts').select('*').order('name', { ascending: true })
      ]);

      if (recRes.data) setRecords(recRes.data);
      if (accRes.data) {
        setAccounts(accRes.data);
        if (!selectedAccountId && accRes.data.length > 0) setSelectedAccountId(accRes.data[0].id);
      }
      if (catRes.data) {
        setExpenseCategories(catRes.data.filter(c => c.type === 'expense'));
        setIncomeCategories(catRes.data.filter(c => c.type === 'earning'));
        if (!activeCategory && catRes.data.length > 0) setActiveCategory(catRes.data[0].name);
      }
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSaveRecord = async (e) => {
    if (e) e.preventDefault();
    if (!amount || !user || !supabase || !selectedAccountId) return;

    const recordData = {
      amount: parseFloat(amount),
      type,
      category: activeCategory,
      account_id: selectedAccountId,
      note,
      user_id: user.id
    };

    setLoading(true);
    try {
      const { error } = editingId 
        ? await supabase.from('records').update(recordData).eq('id', editingId)
        : await supabase.from('records').insert([recordData]);
      
      if (error) throw error;
      setEditingId(null);
      setAmount('');
      setNote('');
      fetchData();
    } catch (err) {
      console.error("Save failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Confirm deletion? Account balance will be adjusted.")) return;
    const { error } = await supabase.from('records').delete().eq('id', id);
    if (!error) fetchData();
  };

  // --- UI Helpers ---

  const startEdit = (record) => {
    setEditingId(record.id);
    setAmount(record.amount.toString());
    setType(record.type);
    setActiveCategory(record.category);
    setSelectedAccountId(record.account_id);
    setNote(record.note || '');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

  if (!supabaseLibLoaded) return (
    <div className="min-h-screen bg-[#FFFBF4] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFBF4] text-gray-800 font-sans pb-20">
      <nav className="max-w-7xl mx-auto px-6 py-6 md:py-10 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <img src="src/assets/logo2-crop.png" alt="Logo" className="h-20 w-auto mix-blend-multiply brightness-95" />
          <div>
            <h1 className="text-4xl font-bold text-cashplet-dark tracking-tighter">Cashplet</h1>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Smart Money tracking</span>
          </div>
        </div>
        {user && (
          <div className="flex gap-3">
            <button onClick={() => setView('accounts')} className={`p-3 rounded-2xl ${view === 'accounts' ? 'bg-amber-500 text-white' : 'bg-white border border-amber-50'}`}><Wallet size={22} /></button>
            <button onClick={() => setView('categories')} className={`p-3 rounded-2xl ${view === 'categories' ? 'bg-amber-500 text-white' : 'bg-white border border-amber-50'}`}><Tag size={22} /></button>
            <button onClick={() => supabase.auth.signOut()} className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100"><LogOut size={22} /></button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {!user ? (
          <AuthView supabase={supabase} />
        ) : view === 'accounts' ? (
          <AccountsView setView={setView} accounts={accounts} fetchData={fetchData} />
        ) : view === 'categories' ? (
          <CategoriesView setView={setView} expenseCategories={expenseCategories} incomeCategories={incomeCategories} fetchData={fetchData} />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Analytics Section */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50">
              <div className="flex justify-between items-center mb-8">
                <p className="text-2xl font-black">Quick Analytics</p>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
                  <Calendar size={18} className="text-gray-400" />
                  <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="bg-transparent text-xs font-bold outline-none" />
                  <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="bg-transparent text-xs font-bold outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Income</p>
                  <p className="text-3xl font-black">${analytics.totals.income.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black text-orange-600 uppercase">Expenses</p>
                  <p className="text-3xl font-black">${analytics.totals.expense.toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black text-amber-600 uppercase">Savings</p>
                  <p className="text-3xl font-black">{analytics.totals.income > 0 ? Math.round(((analytics.totals.income - analytics.totals.expense) / analytics.totals.income) * 100) : 0}%</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Wallet & Form */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-10 text-white shadow-2xl">
                  <p className="text-amber-100 text-sm font-bold uppercase mb-2">Net Worth</p>
                  <h2 className="text-5xl font-black mb-10 tracking-tight">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  <div className="space-y-3">
                    {accounts.map(acc => (
                      <div key={acc.id} className="flex justify-between bg-white/10 p-4 rounded-2xl border border-white/5">
                        <span className="font-bold text-sm">{acc.name}</span>
                        <span className="font-black">${parseFloat(acc.balance).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <section ref={formRef} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50">
                  <form onSubmit={handleSaveRecord} className="space-y-6">
                    <div className="flex bg-gray-50 p-1.5 rounded-3xl">
                      <button type="button" onClick={() => setType('expense')} className={`flex-1 py-4 rounded-[1.25rem] text-sm font-black transition-all ${type === 'expense' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}>Expense</button>
                      <button type="button" onClick={() => setType('earning')} className={`flex-1 py-4 rounded-[1.25rem] text-sm font-black transition-all ${type === 'earning' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}>Earning</button>
                    </div>
                    <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full py-4 text-5xl font-black bg-transparent border-b-4 border-gray-50 focus:border-amber-400 outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500">
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                      <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="bg-gray-50 p-4 rounded-2xl font-bold">
                        {(type === 'expense' ? expenseCategories : incomeCategories).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl font-bold" />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-5 rounded-[1.8rem] font-black text-lg bg-amber-500 text-white shadow-xl">{editingId ? 'Update' : 'Save'} Transaction</button>
                      {editingId && <button type="button" onClick={() => setEditingId(null)} className="px-6 py-5 rounded-[1.8rem] font-black bg-gray-100 text-gray-500">Cancel</button>}
                    </div>
                  </form>
                </section>
              </div>

              {/* Right Column: Goals & History */}
              <div className="lg:col-span-7 space-y-6">
                <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50">
                  <h3 className="text-xl font-black flex items-center gap-3 mb-6"><Target size={22} className="text-amber-500" /> Budget Goals</h3>
                  <div className="space-y-6">
                    {expenseCategories.filter(c => c.target > 0).map(cat => {
                      const spent = analytics.spending[cat.name] || 0;
                      const percent = Math.min((spent / cat.target) * 100, 100);
                      return (
                        <div key={cat.id}>
                          <div className="flex justify-between text-xs font-black uppercase mb-2">
                            <span>{cat.name}</span>
                            <span className={spent > cat.target ? 'text-red-500' : 'text-amber-600'}>${spent.toFixed(0)} / ${cat.target}</span>
                          </div>
                          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${spent > cat.target ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50 min-h-[400px]">
                  <h3 className="text-xl font-black flex items-center gap-3 mb-8"><History size={22} className="text-amber-500" /> History</h3>
                  <div className="space-y-4">
                    {records.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 font-bold"><Wallet className="mx-auto mb-4" size={48} />No records found.</div>
                    ) : records.map(r => (
                      <div key={r.id} className="group bg-white p-5 rounded-3xl flex items-center justify-between border border-gray-50 shadow-sm hover:border-amber-100 transition-all">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl ${r.type === 'earning' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                            {r.type === 'earning' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-lg leading-tight">{r.category}</p>
                            <p className="text-[11px] text-gray-400 font-bold uppercase">{new Date(r.created_at).toLocaleDateString()} • {accounts.find(a => a.id === r.account_id)?.name || 'Account'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className={`font-black text-xl ${r.type === 'earning' ? 'text-emerald-500' : 'text-gray-700'}`}>{r.type === 'earning' ? '+' : '-'}${r.amount.toFixed(2)}</p>
                          <button onClick={() => startEdit(r)} className="opacity-0 group-hover:opacity-100 p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><PencilLine size={20} /></button>
                          <button onClick={() => deleteRecord(r.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;