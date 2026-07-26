import React, { useState } from 'react';
import { AppUser } from '../types';
import { Building2, User, Key, ArrowRight, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

interface LoginScreenProps {
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Username dan Password wajib diisi.');
      return;
    }

    // Lookup user in ERP System user database
    const foundUser = users.find(
      (u) => u.username.trim().toLowerCase() === cleanUsername
    );

    if (!foundUser) {
      setErrorMsg(`Username "${username}" tidak terdaftar dalam Sistem Akses User ERP.`);
      return;
    }

    // Verify password against ERP configured user password
    const expectedPassword = (foundUser.password || '123').trim();
    if (cleanPassword !== expectedPassword) {
      setErrorMsg('Password salah! Akses login ditolak oleh Sistem ERP.');
      return;
    }

    // Check account active status
    if (foundUser.status === 'Nonaktif') {
      setErrorMsg('Akun pengguna ini sedang Nonaktif. Hubungi Administrator.');
      return;
    }

    onLoginSuccess(foundUser);
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
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
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
                placeholder="Masukkan username anda"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all placeholder:text-slate-500"
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password anda"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all placeholder:text-slate-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Masuk ke Dashboard ERP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Fill Registered Users List */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Pilih Akun Terdaftar ({users.length} User):</span>
            <span className="text-[10px] text-amber-400">Klik untuk autofill</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs custom-scrollbar">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setUsername(u.username);
                  setPassword(u.password || '123456');
                  setErrorMsg('');
                }}
                className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                  username.trim().toLowerCase() === u.username.toLowerCase()
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-bold text-xs truncate">{u.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    @{u.username} • {u.role}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-amber-400 border border-slate-700">
                    {u.password || '123456'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Info Notice */}
        <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-2xl flex items-start gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-slate-300">Autentikasi Terproteksi:</span> Pengguna baru yang ditambahkan di menu Kelola Akses User / Karyawan akan otomatis muncul di sini dan dapat digunakan untuk login.
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

