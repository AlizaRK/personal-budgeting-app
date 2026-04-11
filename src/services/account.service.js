export const accountService = (supabase, userId) => ({
    async getAll() {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async create(accountData) {
        const { error } = await supabase
            .from('accounts')
            .insert([{
                name: accountData.name,
                balance: accountData.balance,
                type: accountData.type, // This is crucial for your Credit Card logic!
                user_id: userId
            }]);
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