import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';

const CategoriesView = ({ setView, supabase, user }) => {
  const { expenseCategories, incomeCategories, addCategory, removeCategory } = useCategories(supabase, user);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="flex items-center justify-between">
        <button onClick={() => setView('dashboard')} className="p-3 bg-white rounded-2xl border border-amber-50 text-amber-600">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-black text-gray-800">Manage Categories</h2>
        <div className="w-12"></div>
      </header>

      <CategoryForm onAdd={addCategory} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryList title="Expenses" categories={expenseCategories} onRemove={removeCategory} color="orange" />
        <CategoryList title="Income" categories={incomeCategories} onRemove={removeCategory} color="emerald" />
      </div>
    </div>
  );
};

export default CategoriesView;