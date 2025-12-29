
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate brief network delay for UX
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 800);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="glass p-8 w-full max-w-sm flex flex-col gap-6 animate-in slide-in-from-bottom-10 duration-700"
    >
      <div className="text-center mb-2">
        <span className="text-[12px] font-black tracking-[0.6em] uppercase text-white/90 text-glow">
          Login
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <input 
          type="text" 
          required
          placeholder="Identity / Username"
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
        />

        <input 
          type="password" 
          required
          placeholder="Access Key"
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div 
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-white border-white' : 'border-white/20 group-hover:border-white/40'}`}
          >
            {rememberMe && (
              <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Remember Session</span>
        </label>
        <a href="#" className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity">Reset Access</a>
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className="mt-2 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] py-4 rounded-lg hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
      >
        {isLoading ? 'Authenticating...' : 'Authenticate'}
      </button>
    </form>
  );
};
