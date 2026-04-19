import React from 'react';
import { Lock } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import { usePasswordUpdate } from './hooks/usePasswordUpdate';

interface UpdatePasswordViewProps {
  supabase: SupabaseClient;
  setView: (view: string) => void;
}

const UpdatePasswordView: React.FC<UpdatePasswordViewProps> = ({
  supabase,
  setView,
}) => {
  const { password, loading, error, setPassword, updatePassword } =
    usePasswordUpdate(supabase, () => setView('dashboard'));

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-amber-50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800">New Password</h2>
          <p className="text-gray-400 font-bold text-sm mt-2">
            Secure your Cashplet account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={updatePassword} className="space-y-4">
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="password"
              placeholder="Minimum 6 characters"
              required
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-amber-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-amber-600 disabled:opacity-50 transition-all"
          >
            {loading ? 'Updating...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordView;
