import { SupabaseClient } from '@supabase/supabase-js';
import { Category } from '../../../types';

export const categoryService = (supabase: SupabaseClient, userId: string) => ({
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as Category[];
  },

  async create(catData: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .insert([{ ...catData, user_id: userId }]);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  async update(id: string, updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  }
});