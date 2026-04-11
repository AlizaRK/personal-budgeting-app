export const categoryService = (supabase, userId) => ({
    async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async create(catData) {
        const { error } = await supabase
            .from('categories')
            .insert([{ ...catData, user_id: userId }]);
        if (error) throw error;
    },

    async remove(id) {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
    },

    async update(id, updates) {
        const { error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    }
});