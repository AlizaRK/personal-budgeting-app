import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Calendar, Target, History, Wallet, 
    ArrowUpCircle, ArrowDownCircle, PencilLine, Trash2, 
    Tag, AlertCircle, ChevronDown, Check } from 'lucide-react';

// --- HELPER COMPONENT FOR CUSTOM SELECT ---
const CustomFloatingSelect = ({ label, value, options, onChange, icon: Icon, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id === value || opt.name === value);

    return (
        <div className="relative flex-1" ref={containerRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block tracking-widest">
                {label}
            </label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all border-2 
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400 border-transparent' : 'bg-gray-50 text-gray-700 border-transparent hover:border-amber-200'}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {disabled ? <AlertCircle size={16} /> : <Icon size={16} className="text-amber-500" />}
                    <span className="truncate">{disabled ? placeholder : (selectedOption?.name || placeholder)}</span>
                </div>
                {!disabled && <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-height-[250px] overflow-y-auto">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => { onChange(opt.id || opt.name); setIsOpen(false); }}
                                className="w-full flex items-center justify-between p-4 hover:bg-amber-50 transition-colors text-left"
                            >
                                <span className="font-bold text-sm text-gray-700">{opt.name}</span>
                                {(opt.id === value || opt.name === value) && <Check size={16} className="text-amber-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const DashboardView = ({
    analytics,
    totalBalance,
    accounts,
    records,
    dateRange,
    setDateRange,
    type,
    setType,
    amount,
    setAmount,
    selectedAccountId,
    setSelectedAccountId,
    activeCategory,
    setActiveCategory,
    note,
    setNote,
    editingId,
    setEditingId,
    handleSaveRecord,
    startEdit,
    deleteRecord,
    expenseCategories,
    incomeCategories,
    formRef
}) => {
    const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;
    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* 1. Analytics Section */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <p className="text-2xl font-black text-gray-800">Quick Analytics</p>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl w-full md:w-auto">
                        <Calendar size={18} className="text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-transparent text-xs font-bold outline-none"
                        />
                        <span className="text-gray-300">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-transparent text-xs font-bold outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-50 p-6 rounded-3xl">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Income</p>
                        <p className="text-3xl font-black text-emerald-700">${analytics.totals.income.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-3xl">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Expenses</p>
                        <p className="text-3xl font-black text-orange-700">${analytics.totals.expense.toLocaleString()}</p>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-3xl">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Savings Rate</p>
                        <p className="text-3xl font-black text-amber-700">
                            {analytics.totals.income > 0 ? Math.round(((analytics.totals.income - analytics.totals.expense) / analytics.totals.income) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Wallet & Transaction Form */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Wallet Card */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-amber-100 text-xs font-black uppercase tracking-widest mb-2 opacity-80">Total Net Worth</p>
                            <h2 className="text-5xl font-black mb-10 tracking-tight">
                                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                            <div className="space-y-3">
                                {accounts.map(acc => (
                                    <div key={acc.id} className="flex justify-between bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <span className="font-bold text-sm">{acc.name}</span>
                                        <span className="font-black">${parseFloat(acc.balance).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Transaction Form */}
                    {/* Transaction Form */}
                    <section ref={formRef} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50">
                        <form onSubmit={handleSaveRecord} className="space-y-6">
                            {/* Type Toggle */}
                            <div className="flex bg-gray-50 p-1.5 rounded-3xl">
                                <button type="button" onClick={() => setType('expense')} className={`flex-1 py-4 rounded-[1.25rem] text-sm font-black transition-all ${type === 'expense' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}>Expense</button>
                                <button type="button" onClick={() => setType('earning')} className={`flex-1 py-4 rounded-[1.25rem] text-sm font-black transition-all ${type === 'earning' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}>Earning</button>
                            </div>

                            {/* Amount Input */}
                            <div className="relative">
                                <span className="absolute left-0 bottom-4 text-3xl font-black text-gray-300">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full py-4 pl-8 text-5xl font-black bg-transparent border-b-4 border-gray-50 focus:border-amber-400 outline-none transition-all"
                                />
                            </div>

                            {/* Custom Dropdowns Row */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <CustomFloatingSelect
                                    label="Account"
                                    value={selectedAccountId}
                                    options={accounts}
                                    onChange={setSelectedAccountId}
                                    icon={Wallet}
                                    placeholder="No Accounts"
                                    disabled={accounts.length === 0}
                                />
                                <CustomFloatingSelect
                                    label="Category"
                                    value={activeCategory}
                                    options={type === 'expense' ? expenseCategories : incomeCategories}
                                    onChange={setActiveCategory}
                                    icon={Tag}
                                    placeholder="No Categories"
                                    disabled={(type === 'expense' ? expenseCategories : incomeCategories).length === 0}
                                />
                            </div>

                            {/* Note Input */}
                            <input
                                type="text"
                                placeholder="Note (optional)"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-400 focus:bg-white transition-all"
                            />

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={accounts.length === 0}
                                    className={`flex-1 py-5 rounded-[1.8rem] font-black text-lg text-white shadow-xl transition-all active:scale-95 ${editingId ? 'bg-blue-600' : 'bg-amber-500'} ${accounts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {editingId ? 'Update' : 'Save'} Transaction
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null);
                                            setAmount('');
                                            setNote('');
                                        }}
                                        className="px-6 py-5 rounded-[1.8rem] font-black bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>
                </div>

                {/* Right Column: Budget Goals & History */}
                <div className="lg:col-span-7 space-y-6">
                    <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50">
                        <h3 className="text-xl font-black flex items-center gap-3 mb-6"><Target size={22} className="text-amber-500" /> Budget Goals</h3>
                        <div className="space-y-6">
                            {expenseCategories.filter(c => c.target > 0).map(cat => {
                                const spent = analytics.spending[cat.name] || 0;
                                const percent = Math.min((spent / cat.target) * 100, 100);
                                return (
                                    <div key={cat.id}>
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                                            <span>{cat.name}</span>
                                            <span className={spent > cat.target ? 'text-red-500' : 'text-gray-400'}>
                                                ${spent.toFixed(0)} / ${cat.target}
                                            </span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${spent > cat.target ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-amber-50">
                        <h3 className="text-xl font-black flex items-center gap-3 mb-8"><History size={22} className="text-amber-500" /> Recent History</h3>
                        <div className="space-y-4">
                            {records.length === 0 ? (
                                <div className="text-center py-20 text-gray-300 font-bold italic">No records found.</div>
                            ) : records.map(r => (
                                <div key={r.id} className="group bg-white p-5 rounded-[1.8rem] flex items-center justify-between border border-gray-50 shadow-sm hover:border-amber-100 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`p-3 rounded-2xl ${r.type === 'earning' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {r.type === 'earning' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-gray-800 leading-tight truncate">{r.category}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                {new Date(r.created_at).toLocaleDateString()} • {accounts.find(a => a.id === r.account_id)?.name || 'Account'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <p className={`font-black text-lg ${r.type === 'earning' ? 'text-emerald-500' : 'text-gray-700'}`}>
                                            {r.type === 'earning' ? '+' : '-'}${r.amount.toFixed(2)}
                                        </p>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(r)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl"><PencilLine size={18} /></button>
                                            <button onClick={() => deleteRecord(r.id)} className="p-2 text-gray-300 hover:text-red-500 rounded-xl"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;