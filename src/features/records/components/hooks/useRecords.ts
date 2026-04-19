import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { Record } from '../../../../types';
import { recordService } from './api/records.service';

// TODO: Set proper types for user
export const useRecords = (user: any) => {
  const [records, setRecords] = useState<Record[]>([]);
  const recordservice = user ? recordService(user.id) : null;

  const fetchRecords = async () => {
    if (!user) return;

    const data = await recordservice?.getAllRecords();

    setRecords(data || []);
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const createRecord = async (recordData: Record) => {
    if (!user) return;

    const data = await recordservice?.createRecord(recordData);
  };

  const updateRecord = async (
    recordId: string,
    updatedData: Partial<Record>
  ) => {
    if (!user) return;

    await recordservice?.updateRecord(recordId, updatedData);
    fetchRecords();
  };

  const removeRecord = async (recordId: string) => {
    if (!user) return;

    await recordservice?.removeRecord(recordId);
    fetchRecords();
  };

  return {
    records,
    refetch: fetchRecords,
    createRecord,
    updateRecord,
    removeRecord,
  };
};
