import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SupabaseClient,
  Session,
  AuthChangeEvent,
} from '@supabase/supabase-js';

// Modular Imports
import Header from './components/Common/Header';
import AuthView from './features/auth/AuthView';
import AccountsView from './features/accounts/components/AccountsView';
import CategoriesView from './features/categories/components/CategoriesView';
import DashboardView from './features/dashboard/DashboardView';
import DeleteModal from './components/Common/DeleteModal';
import {
  Account,
  Category,
  Record,
  DateRange,
  DeleteModalProps,
} from './types';
import { recordService } from './features/records/components/hooks/api/records.service';
import { categoryService } from './features/categories/api/category.service';
import { User } from '@supabase/supabase-js';
import { useDeleteModal } from './components/Common/hooks/useDeleteModal';

interface DeleteConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const App: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [supabaseLibLoaded, setSupabaseLibLoaded] = useState<boolean>(false);
  const [view, setView] = useState<string>(
    localStorage.getItem('currentView') || 'dashboard'
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Global Sync State (Needed for the Dashboard & Record Form)
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Services
  const categoryservice = user ? categoryService(user.id) : null;
  const recordservice = user ? recordService(user.id) : null;

  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const { deleteConfig, requestDelete, closeDeleteModal } = useDeleteModal();

  // --- Supabase Init ---
  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  useEffect(() => {
    if ((window as any).supabase) {
      setSupabaseLibLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => setSupabaseLibLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  const supabase = useMemo(() => {
    if (!supabaseLibLoaded || !(window as any).supabase) return null;
    return (window as any).supabase.createClient(
      (import.meta as any).env.VITE_SUPABASE_URL,
      (import.meta as any).env.VITE_SUPABASE_ANON_KEY
    );
  }, [supabaseLibLoaded]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) =>
        setUser(session?.user ?? null)
      );
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        if (event === 'PASSWORD_RECOVERY') setView('update-password');
        if (event === 'SIGNED_OUT') {
          setView('dashboard');
          localStorage.removeItem('currentView');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!supabaseLibLoaded)
    return (
      <div className="min-h-screen bg-[#FFFBF4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FFFBF4] text-gray-800 font-sans pb-20">
      {user && (
        <Header
          view={view}
          setView={setView}
          onLogout={() => supabase.auth.signOut()}
        />
      )}

      <main className="max-w-7xl mx-auto px-6">
        {!user ? (
          <AuthView />
        ) : (
          <>
            {view === 'accounts' ? (
              <AccountsView
                setView={setView}
                user={user}
                requestDelete={requestDelete}
              />
            ) : view === 'categories' ? (
              <CategoriesView
                user={user}
                setView={setView}
                requestDelete={requestDelete}
              />
            ) : (
              <DashboardView
                user={user}
                dateRange={dateRange}
                setDateRange={setDateRange}
                formRef={formRef as React.RefObject<HTMLFormElement>}
              />
            )}
          </>
        )}
      </main>
      {/* Delete Confirmation Modal */}
      <DeleteModal {...deleteConfig} onClose={closeDeleteModal} />
    </div>
  );
};

export default App;
