import { useState, useEffect } from 'react';
import { categoryService } from '../services/category.service';

export const useCategories = (supabase, user) => {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const service = categoryService(supabase, user?.id);

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const data = await service.getAll();
      setExpenseCategories(data.filter(c => c.type === 'expense'));
      setIncomeCategories(data.filter(c => c.type === 'earning'));
    } catch (err) { console.error(err.message); }
  };

  useEffect(() => { fetchCategories(); }, [user]);

  const addCategory = async (catData) => {
    await service.create(catData);
    fetchCategories();
  };

  const removeCategory = async (id) => {
    await service.remove(id);
    fetchCategories();
  };

  const editCategory = async (id, updates) => {
    await service.update(id, updates);
    setEditingCategory(null); 
    fetchCategories();
  };

  return { expenseCategories, incomeCategories, addCategory, removeCategory, editCategory, editingCategory };
};