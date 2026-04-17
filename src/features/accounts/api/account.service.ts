import { SupabaseClient } from '@supabase/supabase-js';
import { AccountData, Account } from '../../../types/AccountProps';

export const accountService = (supabase: SupabaseClient, userId: string) => ({
  async getAll(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as Account[];
  },

  async create(accountData: AccountData): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .insert([{
        name: accountData.name,
        balance: accountData.balance,
        type: accountData.type,
        user_id: userId
      }]);
    if (error) throw error;
  },

  async update(id: string, updates: Partial<AccountData>): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  }
});