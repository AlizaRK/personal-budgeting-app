import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category } from '../../types';

interface CategoryFormProps {
  onAdd: (categoryData: Omit<Category, 'id' | 'user_id' | 'created_at'>) => void;
  onEdit: (id: string, updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>) => void;
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onAdd, onEdit, editingCategory, setEditingCategory }) => {
  const [name, setName] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [type, setType] = useState<'expense' | 'earning'>('expense');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setTarget(editingCategory.target?.toString() || '');
      setType(editingCategory.type);
    } else {
      setName('');
      setTarget('');
      setType('expense');
    }
  }, [editingCategory]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    const categoryData = {
      name: name.trim(),
      target: parseFloat(target) || 0,
      type: type
    };

    if (editingCategory) {
      onEdit(editingCategory.id, categoryData);
    } else {
      onAdd(categoryData);
    }

    // Reset local state
    setName('');
    setTarget('');
    setEditingCategory(null);
  };

  return (
    <section className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-amber-50 relative">
      {/* Cancel Edit Button */}
      {editingCategory && (
        <button
          onClick={() => setEditingCategory(null)}
          className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
        </button>
      )}

      <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4">
        {editingCategory ? 'Update Category' : 'Add New Category'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="Name (e.g., Groceries)"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          <input
            type="number"
            placeholder="Monthly Target $"
            value={target}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all duration-200 ${type === 'expense' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
          >
            EXPENSE
          </button>
          <button
            type="button"
            onClick={() => setType('earning')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all duration-200 ${type === 'earning' ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
          >
            INCOME
          </button>
        </div>

        <button
          type="submit"
          className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${editingCategory
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
        >
          {editingCategory ? 'Update Category' : 'Create Category'}
        </button>
      </form>
    </section>
  );
};

export default CategoryForm;