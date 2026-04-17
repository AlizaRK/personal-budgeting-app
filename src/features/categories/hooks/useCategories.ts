import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Category } from '../../../types';
import { categoryService } from '../api/category.service';
import { User } from '../../../types/index'

export const useCategories = (supabase: SupabaseClient, user: User | null) => {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const service = user ? categoryService(supabase, user.id) : null;

  const fetchCategories = async (): Promise<void> => {
    if (!user || !service) return;
    try {
      const data: Category[] = await service.getAll();
      setExpenseCategories(data.filter(c => c.type === 'expense'));
      setIncomeCategories(data.filter(c => c.type === 'earning'));
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

  const addCategory = async (catData: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<void> => {
    if (!service) return;
    await service.create(catData);
    fetchCategories();
  };

  const removeCategory = async (id: string): Promise<void> => {
    if (!service) return;
    await service.remove(id);
    fetchCategories();
  };

  const editCategory = async (id: string, updatedData: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
      setEditingCategory(null);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error updating category:", err.message);
      } else {
        console.error("Error updating category:", err);
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
    editingCategory
  };
};