import { useState, useEffect } from 'react';
import { Category } from '../../../types';
import { categoryService } from '../api/category.service';
import { User as SupabaseUser } from '@supabase/supabase-js';

export const useCategories = (user: SupabaseUser | null) => {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const service = user ? categoryService(user.id) : null;

  const fetchCategories = async (): Promise<void> => {
    if (!user || !service) return;
    try {
      const data: Category[] = await service.getAll();
      setExpenseCategories(data.filter((c) => c.type === 'expense'));
      setIncomeCategories(data.filter((c) => c.type === 'earning'));
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const addCategory = async (
    catData: Omit<Category, 'id' | 'user_id' | 'created_at'>
  ): Promise<void> => {
    if (!service) return;
    await service.createCategory(catData);
    fetchCategories();
  };

  const removeCategory = async (id: string): Promise<void> => {
    if (!service) return;
    await service.removeCategory(id);
    fetchCategories();
  };

  const editCategory = async (
    id: string,
    updatedData: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>
  ): Promise<void> => {
    try {
      service?.updateCategory(id, updatedData);

      await fetchCategories();
      setEditingCategory(null);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error updating category:', err.message);
      } else {
        console.error('Error updating category:', err);
      }
    }
  };

  return {
    expenseCategories,
    incomeCategories,
    addCategory,
    removeCategory,
    editCategory,
    setEditingCategory,
    editingCategory,
  };
};
