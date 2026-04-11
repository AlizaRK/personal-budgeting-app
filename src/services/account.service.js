export const accountService = (supabase, userId) => ({
  async getAll() {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(name, balance) {
    const { error } = await supabase
      .from('accounts')
      .insert([{ name, balance, user_id: userId }]);
    if (error) throw error;
  },

  async update(id, updates) {
    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id) {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  }
});