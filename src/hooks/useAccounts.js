import { useState, useEffect } from 'react';
import { accountService } from '../services/account.service';

export const useAccounts = (supabase, user) => {
    const [accounts, setAccounts] = useState([]);
    const [editingAccount, setEditingAccount] = useState(null);
    const service = accountService(supabase, user?.id);

    const fetchAccounts = async () => {
        if (!user) return;
        try {
            const data = await service.getAll();
            setAccounts(data);
        } catch (err) { console.error(err.message); }
    };

    useEffect(() => { fetchAccounts(); }, [user]);

    const addAccount = async (accountData) => {
        await service.create(accountData);
        fetchAccounts();
    };

    const editAccount = async (id, updates) => {
        await service.update(id, updates);
        setEditingAccount(null);
        fetchAccounts();
    };

    const removeAccount = async (id) => {
        try {
            await service.remove(id);
            fetchAccounts();
        } catch (err) {
            console.error(err.message);
        }
    };

    return { accounts, editingAccount, setEditingAccount, addAccount, editAccount, removeAccount };
};