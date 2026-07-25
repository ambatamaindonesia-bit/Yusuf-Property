import React from 'react';
import {
  HousingProject,
  Unit,
  SalesTransaction,
  ConstructionMilestone,
  FinancialRecord,
} from '../types';
import { formatRupiah, formatRupiahShort, getKprStatusLabel, getUnitStatusBadge } from '../utils/formatters';
import {
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  Wallet,
  Building,
  FileText,
  HardHat,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface DashboardOverviewProps {
  projects: HousingProject[];
  units: Unit[];
  sales: SalesTransaction[];
  construction: ConstructionMilestone[];
  finances: FinancialRecord[];
  onNavigateTab: (tab: any) => void;
  onOpenNewTransaction: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects,
  units,
  sales,
  construction,
  finances,
  onNavigateTab,
  onOpenNewTransaction,
}) => {
  // Calculated stats
  const totalOmset = sales.reduce((acc, curr) => acc + curr.agreedPrice, 0);
  const totalUnits = units.length;
  const availableUnits = units.filter((u) => u.status === 'available').length;
  const bookingUnits = units.filter((u) => u.status === 'booking').length;
  const soldUnits = units.filter((u) => u.status === 'sold').length;

  const totalKprCair = sales
    .filter((s) => s.kprStatus === 'cair_100' || s.kprStatus === 'cair_stage_1')
    .reduce((acc, curr) => acc + (curr.kprAmount || 0), 0);

  const avgConstructionProgress = Math.round(
    units.reduce((acc, curr) => acc + curr.progressPercent, 0) / (units.length || 1)
  );

  // Chart data for Unit Distribution
  const unitPieData = [
    { name: 'Tersedia', value: availableUnits, color: '#10b981' },
    { name: 'Booking / Process', value: bookingUnits, color: '#f59e0b' },
    { name: 'Terjual / Akad', value: soldUnits, color: '#f43f5e' },
  ];

  // Chart data for Projects comparison
  const projectChartData = projects.map((p) => {
    const projSales = sales.filter((s) => s.projectName === p.name);
    const projRev = projSales.reduce((acc, curr) => acc + curr.agreedPrice, 0);
    return {
      name: p.name.replace('Yusuf ', '').replace('Residence', 'Res.'),
      Omset: projRev / 1000000000, // in Billions
      Terjual: p.unitsSold,
      Tersedia: p.unitsAvailable,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-2xl text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Dashboard Utama ERP
              </span>
              <span className="text-xs text-slate-300">YUSUF PROPERTY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Selamat Datang di <span className="text-amber-400">Yusuf Property ERP</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Platform Manajemen Developer Perumahan Terpadu: Stok Unit, SPR Penjualan, Tracking KPR Bank, Kontrol Konstruksi, dan Kas Proyek.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Input SPR Baru</span>
            </button>
            <button
              onClick={() => onNavigateTab('siteplan')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Site Plan Digital</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Omset Penjualan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Omset Penjualan</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatRupiahShort(totalOmset)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{sales.length} SPR Terdaftar</span> dari {units.length} unit total
            </p>
          </div>
        </div>

        {/* Stok Unit Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Penjualan & Stok Unit</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{soldUnits} <span className="text-xs font-medium text-slate-500">Terjual</span></span>
              <span className="text-slate-300">/</span>
              <span className="text-emerald-600">{availableUnits} <span className="text-xs font-medium text-slate-500">Tersedia</span></span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {bookingUnits} unit dalam proses KPR / Booking
            </p>
          </div>
        </div>

        {/* Pencairan KPR Bank */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Pencairan KPR Bank</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight">
              {formatRupiahShort(totalKprCair)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sudah cair dari Bank Kerjasama (BTN, BSI, BCA)
            </p>
          </div>
        </div>

        {/* Progres Konstruksi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Rata2 Progres Fisik</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{avgConstructionProgress}%</span>
              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${avgConstructionProgress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {construction.filter((c) => c.status === 'in_progress').length} unit aktif dibangun
            </p>
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Omset Per Proyek Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Omset Penjualan per Proyek (Milyar Rp)</h3>
              <p className="text-xs text-slate-500">Perbandingan performa proyek Yusuf Property</p>
            </div>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>Detail Proyek</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(value: any) => [`Rp ${value} Milyar`, 'Omset']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="Omset" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unit Status Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Status Stok Unit</h3>
            <p className="text-xs text-slate-500">Distribusi status unit perumahan</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={unitPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {unitPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Unit`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            {unitPieData.map((d) => (
              <div key={d.name} className="p-1.5 rounded-lg bg-slate-50">
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ backgroundColor: d.color }}></div>
                <div className="font-bold text-slate-800">{d.value}</div>
                <div className="text-[10px] text-slate-500">{d.name}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Proyek Perumahan Aktif Cards */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Proyek Perumahan Yusuf Property</h3>
            <p className="text-xs text-slate-500">Lokasi perumahan aktif dan perkembangan stok</p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Kelola Proyek</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const projUnits = units.filter((u) => u.projectId === proj.id);
            const sold = projUnits.filter((u) => u.status === 'sold').length;
            const available = projUnits.filter((u) => u.status === 'available').length;
            const booking = projUnits.filter((u) => u.status === 'booking').length;

            return (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-slate-500">{proj.city}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Aktif
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Mulai Dari:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(proj.startingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Legalitas:</span>
                    <span className="font-medium text-emerald-700">{proj.developerLegal.split('-')[1]?.trim() || 'Lengkap'}</span>
                  </div>

                  {/* Stock Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span>Terjual: {sold} / {proj.totalUnits} Unit</span>
                      <span className="text-amber-600 font-bold">{Math.round((sold / (proj.totalUnits || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-rose-500 h-full"
                        style={{ width: `${(sold / proj.totalUnits) * 100}%` }}
                        title="Terjual"
                      ></div>
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${(booking / proj.totalUnits) * 100}%` }}
                        title="Booking"
                      ></div>
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(available / proj.totalUnits) * 100}%` }}
                        title="Tersedia"
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 text-[11px]">{available} Unit Tersedia</span>
                  <button
                    onClick={() => onNavigateTab('siteplan')}
                    className="text-amber-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Site Plan</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent SPR Sales & KPR Status Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Transaksi SPR & Tracking KPR Terbaru</h3>
            <p className="text-xs text-slate-500">Pemberkasan dan status pengajuan KPR ke Bank Kerjasama</p>
          </div>
          <button
            onClick={() => onNavigateTab('sales')}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Semua Transaksi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3">No. SPR / Tanggal</th>
                <th className="p-3">Unit / Proyek</th>
                <th className="p-3">Konsumen</th>
                <th className="p-3">Skema / Harga</th>
                <th className="p-3">Bank KPR</th>
                <th className="p-3">Status KPR Bank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {sales.slice(0, 5).map((sale) => {
                const kprInfo = getKprStatusLabel(sale.kprStatus);
                return (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{sale.sprNumber}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{sale.transactionDate}</div>
                    </td>
                    <td className="p-3 font-bold text-amber-600">
                      <div>Unit {sale.unitCode}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{sale.projectName}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{sale.buyer.name}</div>
                      <div className="text-[10px] text-slate-500">{sale.buyer.phone}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{formatRupiah(sale.agreedPrice)}</div>
                      <span className="text-[10px] font-normal text-slate-500 uppercase">
                        {sale.paymentType === 'kpr' ? 'KPR Bank' : sale.paymentType === 'cash_keras' ? 'Cash Keras' : 'Cash Bertahap'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {sale.kprBank || '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[11px] font-semibold ${kprInfo.color}`}>
                        {kprInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
