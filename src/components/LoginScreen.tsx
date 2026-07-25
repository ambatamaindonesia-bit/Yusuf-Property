import React, { useState } from 'react';
import { AppUser } from '../types';
import { Building2, Lock, User, Key, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!foundUser) {
      setErrorMsg('Username tidak ditemukan dalam sistem ERP.');
      return;
    }

    if (foundUser.password && foundUser.password !== password) {
      setErrorMsg('Password salah! Silakan coba lagi.');
      return;
    }

    if (foundUser.status === 'Nonaktif') {
      setErrorMsg('Akun pengguna ini sedang Nonaktif. Hubungi Admin.');
      return;
    }

    onLoginSuccess(foundUser);
  };

  const quickSelectUser = (u: AppUser) => {
    setUsername(u.username);
    setPassword(u.password || '123');
    setErrorMsg('');
    onLoginSuccess(u);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-4 ring-amber-400/30">
            <Building2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight pt-2">
            YUSUF <span className="text-amber-400">PROPERTY</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            System ERP Developer Perumahan & Management KPR
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Username ERP
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Masuk ke Dashboard ERP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Accounts list */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            Pilih Akun Pengguna Cepat:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => quickSelectUser(u)}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between text-left transition-all text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">{u.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Role: <span className="text-amber-400 font-semibold">{u.role}</span> {u.marketingType !== '-' && `(${u.marketingType})`}
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-500/10 text-amber-300 rounded text-[10px] font-bold border border-amber-500/20">
                  Login ({u.username})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500">
          PT Yusuf Property Indonesia • ERP Developer v2.5
        </div>

      </div>
    </div>
  );
};
