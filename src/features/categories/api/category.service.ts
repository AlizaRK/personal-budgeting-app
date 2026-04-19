import { supabase } from '../../../lib/supabaseClient';
import { Category } from '../../../types';

export const categoryService = (userId: string) => ({
  async getAll(): Promise<any> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as any;
  },

  async createCategory(
    catData: Omit<Category, 'id' | 'user_id' | 'created_at'>
  ): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .insert([{ ...catData, user_id: userId }]);
    if (error) throw error;
  },

  async removeCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>
  ): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },
});
