import React from 'react';
import {
  LayoutDashboard,
  Building,
  Grid3X3,
  FileCheck2,
  Calculator,
  HardHat,
  Wallet,
  BarChart3,
  Users,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Clock,
  HelpCircle,
  FolderCheck,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'projects'
  | 'siteplan'
  | 'sales'
  | 'user_data'
  | 'employees'
  | 'user_access'
  | 'kpr_calc'
  | 'construction'
  | 'finance'
  | 'reports';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unitsCount: {
    total: number;
    available: number;
    booking: number;
    sold: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unitsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'projects' as TabType,
      label: 'Proyek Perumahan',
      icon: Building,
      badge: null,
    },
    {
      id: 'siteplan' as TabType,
      label: 'Site Plan & Stok Unit',
      icon: Grid3X3,
      badge: `${unitsCount.available} Tersedia`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'sales' as TabType,
      label: 'Penjualan & KPR (SPR)',
      icon: FileCheck2,
      badge: `${unitsCount.booking} Process`,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'user_data' as TabType,
      label: 'Data User & Berkas KPR',
      icon: FolderCheck,
      badge: 'Berkas User',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'employees' as TabType,
      label: 'Karyawan & Marketing',
      icon: Users,
      badge: null,
    },
    {
      id: 'user_access' as TabType,
      label: 'Kelola Akses User ERP',
      icon: ShieldCheck,
      badge: 'Hak Akses',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'kpr_calc' as TabType,
      label: 'Kalkulator KPR',
      icon: Calculator,
      badge: 'Simulasi',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'construction' as TabType,
      label: 'Konstruksi & Mandor',
      icon: HardHat,
      badge: null,
    },
    {
      id: 'finance' as TabType,
      label: 'Keuangan & Cashflow',
      icon: Wallet,
      badge: null,
    },
    {
      id: 'reports' as TabType,
      label: 'Laporan ERP Developer',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-r border-slate-800 flex flex-col justify-between">
      <div className="p-4 space-y-6">
        
        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            MODUL ERP YUSUF PROPERTY
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Stock Summary Box */}
        <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Stok Unit Ringkasan
            </span>
            <span className="text-[10px] font-bold text-slate-400">Total: {unitsCount.total} Unit</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-1">
            <div className="p-1.5 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-emerald-300">
              <div className="font-bold text-sm text-emerald-400">{unitsCount.available}</div>
              <div className="text-[9px]">Tersedia</div>
            </div>
            <div className="p-1.5 bg-amber-950/60 border border-amber-800/50 rounded-lg text-amber-300">
              <div className="font-bold text-sm text-amber-400">{unitsCount.booking}</div>
              <div className="text-[9px]">Booking</div>
            </div>
            <div className="p-1.5 bg-rose-950/60 border border-rose-800/50 rounded-lg text-rose-300">
              <div className="font-bold text-sm text-rose-400">{unitsCount.sold}</div>
              <div className="text-[9px]">Terjual</div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Yusuf Property v2.5
        </div>
        <p className="text-[10px] text-slate-500">
          Integrated Housing Developer ERP System
        </p>
      </div>
    </aside>
  );
};
