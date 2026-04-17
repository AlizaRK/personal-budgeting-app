import React from 'react';
import { Wallet, Mail, Lock } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useAuthActions } from './hooks/useAuthActions';

interface AuthViewProps {
  supabase: SupabaseClient;
}

const AuthView: React.FC<AuthViewProps> = ({ supabase }) => {
  const { authState, setAuthStateField, handleForgotPassword, handleAuth, toggleMode } = useAuthActions(supabase);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-amber-50">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500 p-4 rounded-3xl text-white shadow-xl mb-4">
            <Wallet size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">
            {authState.isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
        </div>

        {authState.error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100">{authState.error}</div>}
        {authState.message && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-emerald-100">{authState.message}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              value={authState.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthStateField('email', e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              value={authState.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthStateField('password', e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={authState.loading}
            className="w-full py-5 bg-amber-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {authState.loading ? "Processing..." : (authState.isLogin ? "Login" : "Signup")}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={toggleMode} className="text-sm font-black text-amber-600 uppercase tracking-widest">
            {authState.isLogin ? "Need an account? Signup" : "Have an account? Login"}
          </button>

          {authState.isLogin && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={authState.loading}
              className="text-xs font-bold text-gray-400 hover:text-amber-500 underline disabled:opacity-50"
            >
              Forgot Password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;