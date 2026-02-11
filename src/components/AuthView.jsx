import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

const AuthView = ({ supabase }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleManualForgot = () => {
    if (!email) return setError("Enter your email so we know which account to reset.");
    const subject = encodeURIComponent("Password Reset Request - Cashplet");
    const body = encodeURIComponent(`Hi, I forgot my password for the account: ${email}. Please reset it for me.`);
    window.location.href = `mailto:aliza.khorasi@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return setError('Database connection not established.');
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        // --- SIGNUP LOGIC ---
        const { data, error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (authError) throw authError;
        
        // If email confirmation is enabled in Supabase, session will be null
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
          <input 
            type="email" 
            placeholder="Email" 
            required 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 bg-amber-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-amber-600 active:scale-95 transition-all"
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Signup")}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-black text-amber-600 uppercase tracking-widest">
            {isLogin ? "Need an account? Signup" : "Have an account? Login"}
          </button>
          {isLogin && (
            <button onClick={handleManualForgot} className="text-xs font-bold text-gray-400 hover:text-amber-500 underline">
              Forgot Password? (Contact Admin)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;