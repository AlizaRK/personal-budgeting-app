import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface PasswordUpdateState {
  password: string;
  loading: boolean;
  error: string;
}

export const usePasswordUpdate = (
  supabase: SupabaseClient,
  onSuccess: () => void
) => {
  const [state, setState] = useState<PasswordUpdateState>({
    password: '',
    loading: false,
    error: '',
  });

  const setPassword = (password: string) => {
    setState((prev) => ({ ...prev, password }));
  };

  const updatePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: '' }));

    const { error: updateError } = await supabase.auth.updateUser({
      password: state.password,
    });

    if (updateError) {
      setState((prev) => ({
        ...prev,
        error: updateError.message,
        loading: false,
      }));
    } else {
      alert('Password updated successfully!');
      onSuccess();
    }
  };

  return {
    password: state.password,
    loading: state.loading,
    error: state.error,
    setPassword,
    updatePassword,
  };
};
