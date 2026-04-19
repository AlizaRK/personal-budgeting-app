import { supabase } from '../../../../../lib/supabaseClient.ts';
import { Record } from '../../../../../types/index.ts';

export const recordService = (userId: string) => ({
  async createRecord(recordData: Record) {
    const { error } = await supabase.from('records').insert([recordData]);
    if (error) throw error;
  },

  async getAllRecords() {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as any;
  },

  async getRecordById(recordId: string) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('id', recordId)
      .single();
    if (error) throw error;
    return data as Record;
  },

  async getRecordsByUserId() {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data as Record[];
  },

  async updateRecord(recordId: string, updatedData: Partial<Record>) {
    const { error } = await supabase
      .from('records')
      .update(updatedData)
      .eq('id', recordId);
    if (error) throw error;
    return true;
  },

  async removeRecord(recordId: string) {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', recordId);
    if (error) throw error;
    return true;
  },

  async getRecordsByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    if (error) throw error;
    return data as Record[];
  },
});
