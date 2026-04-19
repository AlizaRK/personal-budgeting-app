import React from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Target,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryListProps {
  title: string;
  categories: Category[];
  onEdit: (category: Category) => void;
  onRemove: (id: string) => void;
  color: 'orange' | 'emerald';
}

const CategoryList: React.FC<CategoryListProps> = ({
  title,
  categories,
  onEdit,
  onRemove,
  color,
}) => {
  const isExpense = color === 'orange';
  const Icon = isExpense ? ArrowDownCircle : ArrowUpCircle;
  const textColor = isExpense ? 'text-orange-600' : 'text-emerald-600';

  return (
    <div className="space-y-4">
      <h4 className={`font-black ${textColor} flex items-center gap-2 px-2`}>
        <Icon size={18} /> {title}
      </h4>

      {categories.length === 0 ? (
        <p className="text-xs font-bold text-gray-300 px-2 italic">
          No categories yet.
        </p>
      ) : (
        categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-4 rounded-[1.5rem] flex items-center border border-amber-50 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-800 truncate">{cat.name}</p>
              {cat.target > 0 && (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <Target size={10} /> ${cat.target}/mo
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => onEdit(cat)}
                className="p-2.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onRemove(cat.id)}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CategoryList;
