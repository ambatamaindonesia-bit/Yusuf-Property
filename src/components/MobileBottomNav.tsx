import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  BadgeDollarSign,
  Wallet,
  Menu,
  X,
  Users,
  HardHat,
  BarChart3,
  Calculator,
  Database,
  UserCheck,
  Megaphone,
  UserCog,
  FileSpreadsheet,
  LogOut,
  Smartphone
} from 'lucide-react';
import { AppUser } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenKprCalc: () => void;
  onOpenDatabaseSync: () => void;
  allowedTabs: string[];
  isMobileFrameActive: boolean;
  onToggleMobileFrame: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenKprCalc,
  onOpenDatabaseSync,
  allowedTabs,
  isMobileFrameActive,
  onToggleMobileFrame,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isTabAllowed = (tabName: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Super Admin') return true;
    return allowedTabs.includes(tabName);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Proyek', icon: Building2 },
    { id: 'sales', label: 'Sales SPR', icon: BadgeDollarSign },
    { id: 'finance', label: 'Keuangan', icon: Wallet },
  ];

  const drawerMenuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Manajemen Proyek & Unit', icon: Building2 },
    { id: 'sales', label: 'Penjualan & KPR (SPR)', icon: BadgeDollarSign },
    { id: 'finance', label: 'Keuangan & Pembayaran', icon: Wallet },
    { id: 'prospects', label: 'Database Prospek Sales', icon: UserCheck },
    { id: 'prospect_reports', label: 'Laporan Harian Prospek', icon: FileSpreadsheet },
    { id: 'construction', label: 'Konstruksi & Material', icon: HardHat },
    { id: 'marketing_team', label: 'Marketing & Komisi', icon: Megaphone },
    { id: 'attendance', label: 'Absensi Karyawan GPS', icon: Users },
    { id: 'user_access', label: 'Hak Akses & Pengguna', icon: UserCog },
    { id: 'reports', label: 'Laporan & Analytics ERP', icon: BarChart3 },
  ];

  return (
    <>
      {/* Slide-Up Mobile Quick Menu Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative z-10 bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 text-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Menu Utama ERP</h3>
                  <p className="text-[10px] text-amber-400 font-medium">
                    User: {currentUser?.name} ({currentUser?.role})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  onOpenKprCalc();
                  setIsDrawerOpen(false);
                }}
                className="p-2.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded-xl text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Calculator className="w-4 h-4 text-indigo-400" />
                <span>Simulasi KPR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenDatabaseSync();
                  setIsDrawerOpen(false);
                }}
                className="p-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Sync Supabase</span>
              </button>
            </div>

            {/* Frame Mode Switcher Option inside Drawer */}
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-xs text-white">Mode Tampilan HP Simulator</div>
                  <div className="text-[10px] text-slate-400">Tampilkan frame smartphone di layar monitor</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onToggleMobileFrame();
                  setIsDrawerOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isMobileFrameActive
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isMobileFrameActive ? 'Matikan Frame' : 'Aktifkan Frame HP'}
              </button>
            </div>

            {/* Module Grid List */}
            <div className="grid grid-cols-2 gap-2">
              {drawerMenuItems.map((item) => {
                const allowed = isTabAllowed(item.id);
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!allowed}
                    onClick={() => {
                      if (allowed) {
                        setActiveTab(item.id);
                        setIsDrawerOpen(false);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-md'
                        : allowed
                        ? 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-900/40 border-slate-800/40 text-slate-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="text-xs truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Logout Footer */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Yusuf Property ERP Mobile v2.0</span>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setIsDrawerOpen(false);
                }}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/30 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 text-slate-400 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center text-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const allowed = isTabAllowed(item.id);

            return (
              <button
                key={item.id}
                type="button"
                disabled={!allowed}
                onClick={() => allowed && setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-amber-400 font-bold scale-105'
                    : allowed
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-[10px] truncate w-full">{item.label}</span>
              </button>
            );
          })}

          {/* More Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-amber-400 transition-all"
          >
            <Menu className="w-5 h-5 mb-0.5 text-amber-400" />
            <span className="text-[10px] truncate w-full font-bold text-amber-400">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
