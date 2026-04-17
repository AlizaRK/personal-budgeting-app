import { supabase } from "../../../../../lib/supabaseClient";
import { Record } from "../../../../..//types/index.ts";

export const createRecord = async (recordData: Record) => {
  return supabase.from('records').insert([recordData]);
};