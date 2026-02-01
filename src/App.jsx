import React, { useState, useEffect, useMemo } from 'react';
import {
  PencilLine,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Wallet,
  LayoutDashboard,
  Tag,
  ChevronLeft,
  Trash2,
  Target,
  LogOut,
  TrendingUp,
  Calendar
} from 'lucide-react';
import AccountsView from './components/AccountsView';
import CategoriesView from './components/CategoriesView';

// --- Paste this above your App component ---

const AuthView = ({ supabase, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return setError('Waiting for database library...');
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (authError) throw authError;
      } else {
        // Signup Logic (with auto-login assumption)
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password
        });

        if (authError) throw authError;

        // If "Confirm Email" is OFF in dashboard, session will exist immediately
        if (!data.session) {
          // This hits if you forgot to turn off the toggle in the dashboard
          setError("Signup successful, but email confirmation is still required in your Supabase settings.");
          setLoading(false);
          return;
        }
      }

      onAuthSuccess();
    } catch (err) {
      // Clearer error reporting for common issues
      let friendlyMessage = err.message;
      if (err.message.includes("User already registered")) {
        friendlyMessage = "This email is already in use. Try logging in instead.";
      } else if (err.message.includes("should be at least 6 characters")) {
        friendlyMessage = "Password is too weak. It must be at least 6 characters.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-amber-50">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500 p-4 rounded-3xl text-white shadow-xl mb-4">
            <Wallet size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
        </div>
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100">{error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full py-5 bg-amber-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-amber-600 active:scale-95 transition-all">
            {loading ? "Processing..." : (isLogin ? "Login" : "Signup")}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-8 w-full text-center text-sm font-black text-amber-600 uppercase tracking-widest">
          {isLogin ? "Need an account? Signup" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const formRef = React.useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [supabaseLibLoaded, setSupabaseLibLoaded] = useState(false);

  // Persistence and View States
  const [view, setView] = useState(localStorage.getItem('currentView') || 'dashboard');
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  // Analytics Date State
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  // Record Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [note, setNote] = useState('');

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatTarget, setNewCatTarget] = useState('');
  const [newCatType, setNewCatType] = useState('expense');

  // --- Supabase Loader Logic ---
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
    if (!url || !key) return null;
    return window.supabase.createClient(url, key);
  }, [supabaseLibLoaded]);

  // Auth Listener
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const fetchRecords = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('records').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      setRecords(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    if (!user || !supabase) return;
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (data) {
      setExpenseCategories(data.filter(c => c.type === 'expense'));
      setIncomeCategories(data.filter(c => c.type === 'earning'));
      if (data.length > 0 && !activeCategory) setActiveCategory(data[0].name);
    }
  };

  const fetchAccounts = async () => {
    if (!user || !supabase) return;
    const { data } = await supabase.from('accounts').select('*').order('name', { ascending: true });
    if (data) {
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) setSelectedAccountId(data[0].id);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
      fetchCategories();
      fetchAccounts();
    }
  }, [user]);

  const [editingId, setEditingId] = useState(null);

  const startEdit = (record) => {
    setEditingId(record.id);
    setAmount(record.amount.toString());
    setType(record.type);
    setActiveCategory(record.category);
    setSelectedAccountId(record.account_id);
    setNote(record.note || '');

    // Scroll specifically to the form instead of the top
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount('');
    setNote('');
  };

  const deleteRecord = async (id) => {
    // Direct advice: Don't skip confirmation for destructive actions.
    if (!window.confirm("Are you sure? This will permanently settle the balance back to your account.")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh everything to see the updated balances and list
      fetchRecords();
      fetchAccounts();
    } catch (err) {
      console.error("Delete failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update your addRecord function to handle both "Insert" and "Update"
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
      if (editingId) {
        // Update existing record
        const { error } = await supabase.from('records').update(recordData).eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase.from('records').insert([recordData]);
        if (error) throw error;
      }

      // Reset form and refresh data
      setEditingId(null);
      setAmount('');
      setNote('');
      fetchRecords();
      fetchAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (name, balance) => {
    if (!name || !user) return;
    const { error } = await supabase.from('accounts').insert([{ name, balance, user_id: user.id }]);
    if (!error) fetchAccounts();
  };

  const deleteAccount = async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) fetchAccounts();
  };

  // --- Analytics Logic ---
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const date = new Date(r.created_at).toISOString().split('T')[0];
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [records, dateRange]);

  const rangeTotals = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => {
      if (curr.type === 'earning') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredRecords]);

  const categorySpending = useMemo(() => {
    return records.reduce((acc, curr) => {
      if (curr.type === 'expense') acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
  }, [records]);

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

  if (!supabaseLibLoaded) return <div className="min-h-screen bg-[#FFFBF4] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#FFFBF4] text-gray-800 font-sans selection:bg-amber-200 pb-20">
      <nav className="max-w-7xl mx-auto px-6 py-6 md:py-10 flex justify-between items-center">
        <div className="flex items-center gap-5">
          {/* Increased height to h-20 (80px) and added contrast filter */}
          <div className="relative flex items-center">
            <img
              src="src/assets/logo2-crop.png"
              alt="Cashplet Logo"
              className="h-20 w-auto object-contain mix-blend-multiply brightness-95"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-bold text-cashplet-dark tracking-tighter leading-none">
              Cashplet
            </h1>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">
              Smart Money. Simple Tracking.
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {user && (
            <>
              <button onClick={() => setView('accounts')} className={`p-3 rounded-2xl transition-all ${view === 'accounts' ? 'bg-amber-500 text-white' : 'bg-white shadow-sm border border-amber-50'}`}><Wallet size={22} /></button>
              <button onClick={() => setView('categories')} className={`p-3 rounded-2xl transition-all ${view === 'categories' ? 'bg-amber-500 text-white' : 'bg-white shadow-sm border border-amber-50'}`}><Tag size={22} /></button>
              <button
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    // The auth listener in useEffect will automatically set user to null
                  } catch (err) {
                    console.error("Logout failed:", err.message);
                  }
                }}
                className="p-3 bg-white shadow-sm border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
              >
                <LogOut size={22} />
              </button>            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {!user ? (
          <AuthView supabase={supabase} onAuthSuccess={() => { fetchRecords(); fetchCategories(); fetchAccounts(); }} />
        ) : view === 'accounts' ? (
          <AccountsView setView={setView} accounts={accounts} addAccount={addAccount} deleteAccount={deleteAccount} />
        ) : view === 'categories' ? (
          <CategoriesView setView={setView} expenseCategories={expenseCategories} incomeCategories={incomeCategories} addCategory={async () => {
            if (!newCatName || !user) return;
            await supabase.from('categories').insert([{ name: newCatName, target: parseFloat(newCatTarget) || 0, type: newCatType, user_id: user.id }]);
            setNewCatName(''); setNewCatTarget(''); fetchCategories();
          }} removeCategory={async (id) => { await supabase.from('categories').delete().eq('id', id); fetchCategories(); }} newCatName={newCatName} setNewCatName={setNewCatName} newCatTarget={newCatTarget} setNewCatTarget={setNewCatTarget} newCatType={newCatType} setNewCatType={setNewCatType} />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* --- ANALYTICS THUMBNAIL --- */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50 overflow-hidden relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 mb-1"><TrendingUp size={14} /> Performance</h3>
                  <p className="text-2xl font-black text-gray-800">Quick Analytics</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <Calendar size={18} className="text-gray-400" />
                  <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="bg-transparent text-xs font-bold outline-none" />
                  <span className="text-gray-300 font-bold">—</span>
                  <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="bg-transparent text-xs font-bold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter mb-1">Range Income</p>
                  <p className="text-3xl font-black text-emerald-700">${rangeTotals.income.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-tighter mb-1">Range Expenses</p>
                  <p className="text-3xl font-black text-orange-700">${rangeTotals.expense.toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter mb-1">Savings Rate</p>
                  <p className="text-3xl font-black text-amber-700">{rangeTotals.income > 0 ? Math.round(((rangeTotals.income - rangeTotals.expense) / rangeTotals.income) * 100) : 0}%</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-10 text-white shadow-2xl">
                  <p className="text-amber-100/70 text-sm font-bold uppercase tracking-widest mb-2">Total Net Worth</p>
                  <h2 className="text-5xl font-black mb-10 tracking-tight">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  <div className="space-y-3">
                    {accounts.map(acc => (
                      <div key={acc.id} className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5">
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
                      <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="bg-gray-50 p-4 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-amber-500">
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                      <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="bg-gray-50 p-4 rounded-2xl font-bold border-none">
                        {(type === 'expense' ? expenseCategories : incomeCategories).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-none" />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-5 rounded-[1.8rem] font-black text-lg bg-amber-500 text-white shadow-xl">
                        {editingId ? 'Update Transaction' : 'Save Transaction'}
                      </button>
                      {editingId && (
                        <button type="button" onClick={cancelEdit} className="px-6 py-5 rounded-[1.8rem] font-black bg-gray-100 text-gray-500">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </section>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50">
                  <h3 className="text-xl font-black flex items-center gap-3 mb-6"><Target size={22} className="text-amber-500" /> Budget Goals</h3>
                  <div className="space-y-6">
                    {expenseCategories.filter(c => c.target > 0).map(cat => {
                      const spent = categorySpending[cat.name] || 0;
                      const percent = Math.min((spent / cat.target) * 100, 100);
                      return (
                        <div key={cat.id}>
                          <div className="flex justify-between text-xs font-black uppercase mb-2"><span>{cat.name}</span><span className={spent > cat.target ? 'text-red-500' : 'text-amber-600'}>${spent.toFixed(0)} / ${cat.target}</span></div>
                          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${spent > cat.target ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }}></div></div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50 min-h-[400px]">
                  <h3 className="text-xl font-black flex items-center gap-3 mb-8"><History size={22} className="text-amber-500" /> History</h3>
                  <div className="space-y-4">
                    {records.length === 0 ? <div className="text-center py-20"><Wallet className="mx-auto mb-4 text-gray-200" size={48} /><p className="text-gray-400 font-bold">No records found.</p></div> : records.map(r => (
                      <div key={r.id} className="group bg-white p-5 rounded-3xl flex items-center justify-between border border-gray-50 shadow-sm transition-all hover:border-amber-100">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl ${r.type === 'earning' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                            {r.type === 'earning' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-lg leading-tight">{r.category}</p>
                            <p className="text-[11px] text-gray-400 font-bold uppercase">
                              {new Date(r.created_at).toLocaleDateString()} • {accounts.find(a => a.id === r.account_id)?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className={`font-black text-xl ${r.type === 'earning' ? 'text-emerald-500' : 'text-gray-700'}`}>
                            {r.type === 'earning' ? '+' : '-'}${r.amount.toFixed(2)}
                          </p>
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => startEdit(r)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            title="Edit Transaction"
                          >
                            <PencilLine size={20} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteRecord(r.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
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