import React, { useState } from 'react';
import { AppUser } from '../types';
import { Building2, User, Key, ArrowRight, ShieldCheck, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import { loadFromCloud } from '../utils/firebase';

interface LoginScreenProps {
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
  onUpdateUsersList?: (users: AppUser[]) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess, onUpdateUsersList }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Username dan Password wajib diisi.');
      return;
    }

    // 1. Check local state first
    let activeUsersList = users;
    let foundUser = activeUsersList.find(
      (u) => u.username.trim().toLowerCase() === cleanUsername
    );

    // 2. If not found in local state, fetch latest from Cloud Firestore
    if (!foundUser) {
      setIsCheckingCloud(true);
      try {
        const cloudUsers = await loadFromCloud<AppUser[]>('yp_erp_users');
        if (cloudUsers && Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          activeUsersList = cloudUsers;
          if (onUpdateUsersList) {
            onUpdateUsersList(cloudUsers);
          }
          foundUser = activeUsersList.find(
            (u) => u.username.trim().toLowerCase() === cleanUsername
          );
        }
      } catch (err) {
        console.error('Error checking cloud users during login:', err);
      } finally {
        setIsCheckingCloud(false);
      }
    }

    if (!foundUser) {
      setErrorMsg(`Username "${username}" tidak terdaftar dalam Sistem Akses User ERP. Hubungi Administrator.`);
      return;
    }

    // Verify password against ERP configured user password
    const expectedPassword = (foundUser.password || '123456').trim();
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
            disabled={isCheckingCloud}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {isCheckingCloud ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Memeriksa Cloud Firestore...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard ERP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

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

