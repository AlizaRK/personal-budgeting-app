import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { Record } from '../../../../types';

// TODO: Set proper types for user
export const useRecords = (user: any) => {
  const [records, setRecords] = useState<Record[]>([]);

  const fetchRecords = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    setRecords(data || []);
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  return { records, refetch: fetchRecords };
};