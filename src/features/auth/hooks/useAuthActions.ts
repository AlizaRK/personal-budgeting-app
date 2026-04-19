import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthState } from '../../../types';

export const useAuthActions = (supabase: SupabaseClient) => {
  const [authState, setAuthState] = useState<AuthState>({
    isLogin: true,
    email: '',
    password: '',
    error: '',
    loading: false,
    message: '',
  });

  const setAuthStateField = <K extends keyof AuthState>(
    field: K,
    value: AuthState[K]
  ) => {
    setAuthState((prev) => ({ ...prev, [field]: value }));
  };

  const resetMessages = () => {
    setAuthStateField('error', '');
    setAuthStateField('message', '');
  };

  const handleForgotPassword = async (): Promise<void> => {
    if (!authState.email) {
      setAuthStateField(
        'error',
        'Enter your email first so we can send a reset link.'
      );
      return;
    }

    setAuthStateField('loading', true);
    resetMessages();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      authState.email,
      {
        redirectTo: 'https://cashplet.app',
      }
    );

    if (resetError) {
      setAuthStateField('error', resetError.message);
    } else {
      setAuthStateField(
        'message',
        'Success! Check your email for the reset link.'
      );
    }
    setAuthStateField('loading', false);
  };

  const handleAuth = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!supabase) {
      setAuthStateField('error', 'Database connection not established.');
      return;
    }
    resetMessages();
    setAuthStateField('loading', true);

    try {
      if (authState.isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: authState.email,
          password: authState.password,
        });
        if (authError) throw authError;
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: authState.email,
          password: authState.password,
          options: {
            emailRedirectTo: 'https://cashplet.app',
          },
        });
        if (authError) throw authError;

        if (!data.session) {
          setAuthStateField(
            'message',
            'Check your email for the confirmation link!'
          );
          setAuthStateField('isLogin', true);
        }
      }
    } catch (err: any) {
      let friendlyMessage: string = err.message;
      if (err.message.includes('User already registered'))
        friendlyMessage = 'Email already in use.';
      if (err.message.includes('at least 6 characters'))
        friendlyMessage = 'Password must be 6+ chars.';
      setAuthStateField('error', friendlyMessage);
    } finally {
      setAuthStateField('loading', false);
    }
  };

  const toggleMode = () => {
    setAuthStateField('isLogin', !authState.isLogin);
    resetMessages();
  };

  return {
    authState,
    setAuthStateField,
    handleForgotPassword,
    handleAuth,
    toggleMode,
  };
};
