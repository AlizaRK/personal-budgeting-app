import { useState, useEffect } from 'react';
import { accountService } from '../api/account.service';
import { Account, AccountData } from '../../../types/AccountProps';
import { SupabaseClient, User } from '@supabase/supabase-js';

export const useAccounts = (user: User | null) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const service = accountService(user?.id || '');

  const fetchAccounts = async (): Promise<void> => {
    if (!user) return;
    try {
      const data: Account[] = await service.getAll();
      setAccounts(data);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const addAccount = async (accountData: AccountData): Promise<void> => {
    try {
      await service.create(accountData);
      await fetchAccounts();
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  const editAccount = async (
    id: string,
    updates: Partial<AccountData>
  ): Promise<void> => {
    try {
      await service.update(id, updates);
      setEditingAccount(null);
      await fetchAccounts();
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  const removeAccount = async (id: string): Promise<void> => {
    try {
      await service.remove(id);
      await fetchAccounts();
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  return {
    accounts,
    editingAccount,
    setEditingAccount,
    addAccount,
    editAccount,
    removeAccount,
  };
};
