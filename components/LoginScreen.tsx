
import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser, activateAccount, resendVerificationCode } from '../services/authService';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, User as UserIcon, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

type AuthView = 'login' | 'register' | 'activation';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  
  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [activationCode, setActivationCode] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (view === 'login') {
        // Login is synchronous in our local DB, but we add delay for realism
        await new Promise(resolve => setTimeout(resolve, 800)); 
        const user = loginUser(email, password);
        onLogin(user);
      } 
      else if (view === 'register') {
        if (!name) throw new Error("Name is required.");
        
        await registerUser(name, email, password);
        setView('activation'); 
      } 
      else if (view === 'activation') {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        const user = activateAccount(email, activationCode);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await resendVerificationCode(email);
      setSuccessMsg("New code sent! Valid for 5 minutes.");
    } catch (err: any) {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* Left Side - Visual / Brand */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/95"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
             <ShieldCheck size={28} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">OmniPost AI</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            {view === 'activation' ? "Check your inbox." : view === 'login' ? "Welcome back." : "Start automating."}
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            {view === 'activation' 
              ? `We've sent a 6-digit verification code to ${email}. The code expires in 5 minutes.`
              : "Manage all your social media channels from a single, AI-powered dashboard."}
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-slate-400 text-sm font-medium">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Help Center</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 animate-fade-in bg-white relative">
        
        <div className="w-full max-w-[420px] space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-xl text-white">
               <ShieldCheck size={32} />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900">
              {view === 'activation' ? "Verify Email" : view === 'login' ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-slate-500 mt-2">
              {view === 'activation' 
                ? `Enter the code sent to ${email}`
                : view === 'login' ? "Enter your credentials to access your dashboard." : "Fill in your details to get started for free."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Activation View */}
            {view === 'activation' && (
              <div className="space-y-4 animate-slide-up">
                 <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Activation Code</label>
                    <button 
                      type="button" 
                      onClick={handleResendCode}
                      disabled={resending}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      {resending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      Resend Code
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white tracking-widest font-mono text-lg"
                      placeholder="000000"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value.replace(/\D/g,''))} // Numbers only
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Login / Register Views */}
            {view !== 'activation' && (
              <>
                {view === 'register' && (
                  <div className="space-y-1.5 animate-slide-up">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-sm font-semibold text-slate-700">Password</label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                     <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-pulse">
                 <AlertCircle size={16} />
                 {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm flex items-center gap-2 animate-pulse">
                 <CheckCircle2 size={16} />
                 {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed hover:transform-none' : ''
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {view === 'activation' ? "Verify Account" : view === 'login' ? "Sign In" : "Create Account"} 
                  {view !== 'activation' && <ArrowRight size={18} />}
                </>
              )}
            </button>
          </form>
          
          <div className="text-center text-slate-500 text-sm">
            {view === 'activation' ? (
              <button 
                 onClick={() => { setView('register'); setSuccessMsg(null); setError(null); }}
                 className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Wrong email? Back to Sign Up
              </button>
            ) : (
              <>
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => {
                    setView(view === 'login' ? 'register' : 'login');
                    setError(null);
                    setSuccessMsg(null);
                    setEmail('');
                    setPassword('');
                    setName('');
                  }}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  {view === 'login' ? "Sign up for free" : "Log in"}
                </button>
              </>
            )}
          </div>

           {/* Default Admin Hint */}
           {view === 'login' && (
             <div className="mt-8 pt-6 border-t border-slate-100 text-center">
               <p className="text-xs text-slate-400 mb-2">Demo Credentials:</p>
               <div className="inline-flex gap-4 text-xs font-mono bg-slate-100 px-3 py-2 rounded border border-slate-200 text-slate-600">
                 <span>admin@omnipost.ai / admin123</span>
               </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
