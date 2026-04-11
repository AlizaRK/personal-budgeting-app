import React, { useState } from 'react';
import { Wallet, Mail, Lock } from 'lucide-react';

const AuthView = ({ supabase }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    if (!email) return setError("Enter your email first so we can send a reset link.");
    
    setLoading(true);
    setError('');
    setMessage('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://cashplet.app',
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Success! Check your email for the reset link.");
    }
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return setError('Database connection not established.');
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://cashplet.app',
          }
        });
        if (authError) throw authError;

        if (!data.session) {
          setMessage("Check your email for the confirmation link!");
          setIsLogin(true);
        }
      }
    } catch (err) {
      let friendlyMessage = err.message;
      if (err.message.includes("User already registered")) friendlyMessage = "Email already in use.";
      if (err.message.includes("at least 6 characters")) friendlyMessage = "Password must be 6+ chars.";
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-amber-50">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500 p-4 rounded-3xl text-white shadow-xl mb-4">
            <Wallet size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100">{error}</div>}
        {message && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-emerald-100">{message}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-amber-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Signup")}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className="text-sm font-black text-amber-600 uppercase tracking-widest">
            {isLogin ? "Need an account? Signup" : "Have an account? Login"}
          </button>
          
          {isLogin && (
            <button 
              type="button"
              onClick={handleForgotPassword} 
              disabled={loading}
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