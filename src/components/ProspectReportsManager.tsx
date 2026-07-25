import React, { useState } from 'react';
import { ProspectRecord, AppUser, HousingProject } from '../types';
import {
  PieChart,
  BarChart3,
  Users,
  ShieldAlert,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Phone,
  MapPin,
  Camera,
  MessageSquare,
  FileSpreadsheet,
  Award,
  TrendingUp,
  UserCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface ProspectReportsManagerProps {
  prospects: ProspectRecord[];
  projects: HousingProject[];
  currentUser: AppUser | null;
}

export const ProspectReportsManager: React.FC<ProspectReportsManagerProps> = ({
  prospects,
  projects,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');

  const isAdminOrManager =
    currentUser?.role === 'Super Admin' || currentUser?.role === 'Manager Marketing';

  // Access Control Guard
  if (!isAdminOrManager) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-black text-rose-950">Akses Terbatas: Khusus Admin & Manager</h2>
          <p className="text-xs text-rose-800 max-w-md mx-auto mt-1">
            Menu <strong>Report Database Prospek User</strong> ini hanya dapat diakses oleh Admin Utama (Super Admin) & Manager Marketing untuk memantau seluruh database prospek dan kinerja sales.
          </p>
        </div>
        <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-slate-700 font-semibold">
          Role Anda saat ini: <span className="text-rose-700 font-bold">{currentUser?.role || 'Guest'}</span>
        </div>
      </div>
    );
  }

  // Master Filtered Prospects
  const filteredProspects = prospects.filter((p) => {
    const matchTerm =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.projectNameInterest && p.projectNameInterest.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchAgent = selectedAgentFilter === 'all' || p.agentName === selectedAgentFilter;
    const matchSource = selectedSourceFilter === 'all' || p.source === selectedSourceFilter;
    const matchStatus = selectedStatusFilter === 'all' || p.status === selectedStatusFilter;
    const matchProject = selectedProjectFilter === 'all' || p.projectNameInterest === selectedProjectFilter;

    return matchTerm && matchAgent && matchSource && matchStatus && matchProject;
  });

  // Analytics Metrics
  const totalProspects = prospects.length;
  const totalDeal = prospects.filter((p) => p.status === 'Deal / Booking Kavling').length;
  const conversionRate = totalProspects > 0 ? ((totalDeal / totalProspects) * 100).toFixed(1) : '0';

  const sourceCounts = {
    medsos: prospects.filter((p) => p.source === 'Iklan Medsos').length,
    visit: prospects.filter((p) => p.source === 'Visit Lokasi Langsung').length,
    brosur: prospects.filter((p) => p.source === 'Sebar Brosur').length,
    referensi: prospects.filter((p) => p.source === 'Referensi').length,
  };

  const statusCounts = {
    berminat: prospects.filter((p) => p.status === 'Berminat').length,
    nego: prospects.filter((p) => p.status === 'Minta Nego Harga').length,
    kpr: prospects.filter((p) => p.status === 'Proses KPR / Pemberkasan').length,
    deal: prospects.filter((p) => p.status === 'Deal / Booking Kavling').length,
    batal: prospects.filter((p) => p.status === 'Batal / Tidak Berminat').length,
  };

  // Agent Performance Grouping
  const agentMap: Record<
    string,
    { agentName: string; total: number; deal: number; berminat: number; lastActive: string }
  > = {};

  prospects.forEach((p) => {
    const key = p.agentName || 'Unknown';
    if (!agentMap[key]) {
      agentMap[key] = { agentName: key, total: 0, deal: 0, berminat: 0, lastActive: p.createdAt };
    }
    agentMap[key].total += 1;
    if (p.status === 'Deal / Booking Kavling') agentMap[key].deal += 1;
    if (p.status === 'Berminat') agentMap[key].berminat += 1;
    if (p.createdAt > agentMap[key].lastActive) agentMap[key].lastActive = p.createdAt;
  });

  const agentStatsList = Object.values(agentMap);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Tanggal Input',
      'Nama Calon User',
      'No Telepon',
      'Alamat',
      'Sumber Prospek',
      'Detail Referensi',
      'Status Prospek',
      'Proyek Diminati',
      'Tipe Rumah',
      'Marketing Agent',
      'Lokasi GPS',
      'Janji Follow Up',
    ];

    const rows = filteredProspects.map((p) => [
      p.id,
      p.createdAt,
      `"${p.name}"`,
      `"${p.phone}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      p.source,
      `"${p.sourceReferenceDetail || '-'}"`,
      p.status,
      `"${p.projectNameInterest || '-'}"`,
      `"${p.preferredUnitType || '-'}"`,
      `"${p.agentName}"`,
      `"${p.locationName || '-'}"`,
      `"${p.nextFollowUpDate || '-'} ${p.nextFollowUpTime || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Report_Database_Prospek_User_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <PieChart className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-black tracking-wide">Report Master Database Prospek User</h1>
            <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-full">
              Khusus Admin & Manager
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Laporan terpusat seluruh masukan prospek calon konsumen dari seluruh staf marketing, efektivitas media iklan & konversi closing
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT LAPORAN CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Total Database Prospek</span>
            <span className="text-2xl font-black text-slate-900">{totalProspects} User</span>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Conversion Rate Closing</span>
            <span className="text-2xl font-black text-emerald-600">{conversionRate}%</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Total Closing (Deal/Booking)</span>
            <span className="text-2xl font-black text-purple-600">{totalDeal} Unit</span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Prospek Berminat Hot</span>
            <span className="text-2xl font-black text-amber-600">{statusCounts.berminat} User</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Breakdown Analytics Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Source Channels Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" /> Analisis Efektivitas Sumber Iklan & Leads
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Total: {totalProspects} Leads</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              { label: 'Iklan Medsos (IG, FB, TikTok, Ads)', count: sourceCounts.medsos, color: 'bg-blue-500', bgLight: 'bg-blue-50 text-blue-900 border-blue-200' },
              { label: 'Visit Lokasi Langsung (Walk-in)', count: sourceCounts.visit, color: 'bg-emerald-500', bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
              { label: 'Sebar Brosur / Canvassing', count: sourceCounts.brosur, color: 'bg-amber-500', bgLight: 'bg-amber-50 text-amber-900 border-amber-200' },
              { label: 'Referensi (Rekomendasi Orang)', count: sourceCounts.referensi, color: 'bg-purple-500', bgLight: 'bg-purple-50 text-purple-900 border-purple-200' },
            ].map((s, idx) => {
              const pct = totalProspects > 0 ? Math.round((s.count / totalProspects) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{s.label}</span>
                    <span>{s.count} Leads ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-500" /> Distribusi Funnel Status Prospek
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Pipeline Sales</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-800 block uppercase">Berminat Hot</span>
              <span className="text-lg font-black text-emerald-700">{statusCounts.berminat}</span>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[10px] font-bold text-amber-800 block uppercase">Minta Nego Harga</span>
              <span className="text-lg font-black text-amber-700">{statusCounts.nego}</span>
            </div>

            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-800 block uppercase">Proses KPR / Pemberkasan</span>
              <span className="text-lg font-black text-indigo-700">{statusCounts.kpr}</span>
            </div>

            <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-[10px] font-bold text-purple-800 block uppercase">Deal / Booking Kavling</span>
              <span className="text-lg font-black text-purple-700">{statusCounts.deal}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Marketing Agent Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-sm">Laporan Performa Input Marketing Agent</h3>
          </div>
          <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            {agentStatsList.length} User Marketing Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                <th className="p-3.5">Nama Marketing Agent</th>
                <th className="p-3.5 text-center">Total Prospek</th>
                <th className="p-3.5 text-center">Berminat Hot</th>
                <th className="p-3.5 text-center">Deal / Booking</th>
                <th className="p-3.5 text-center">Closing Rate</th>
                <th className="p-3.5">Aktivitas Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {agentStatsList.map((ag, idx) => {
                const rate = ag.total > 0 ? ((ag.deal / ag.total) * 100).toFixed(1) : '0';
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 font-extrabold flex items-center justify-center text-xs">
                        {ag.agentName.charAt(0)}
                      </div>
                      <span>{ag.agentName}</span>
                    </td>
                    <td className="p-3.5 text-center font-black text-slate-900">{ag.total}</td>
                    <td className="p-3.5 text-center font-bold text-amber-600">{ag.berminat}</td>
                    <td className="p-3.5 text-center font-black text-purple-600">{ag.deal}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-600">{rate}%</td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{ag.lastActive}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Master Database Prospek Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" /> Master Database Seluruh Prospek User
            </h3>
            <p className="text-[11px] text-slate-500">
              Menampilkan {filteredProspects.length} data dari total {prospects.length} database prospek
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari prospek, hp, agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" /> Filter Report:
          </span>

          <select
            value={selectedAgentFilter}
            onChange={(e) => setSelectedAgentFilter(e.target.value)}
            className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Marketing Agent</option>
            {agentStatsList.map((a, i) => (
              <option key={i} value={a.agentName}>
                {a.agentName}
              </option>
            ))}
          </select>

          <select
            value={selectedSourceFilter}
            onChange={(e) => setSelectedSourceFilter(e.target.value)}
            className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Sumber Iklan</option>
            <option value="Iklan Medsos">Iklan Medsos</option>
            <option value="Visit Lokasi Langsung">Visit Lokasi Langsung</option>
            <option value="Sebar Brosur">Sebar Brosur</option>
            <option value="Referensi">Referensi</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Status Prospek</option>
            <option value="Berminat">Berminat</option>
            <option value="Cuma Tanya-tanya">Cuma Tanya-tanya</option>
            <option value="Masih Dirundingkan">Masih Dirundingkan</option>
            <option value="Minta Nego Harga">Minta Nego Harga</option>
            <option value="Proses KPR / Pemberkasan">Proses KPR / Pemberkasan</option>
            <option value="Deal / Booking Kavling">Deal / Booking Kavling</option>
            <option value="Batal / Tidak Berminat">Batal / Tidak Berminat</option>
          </select>

          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Proyek</option>
            {projects.map((pr) => (
              <option key={pr.id} value={pr.name}>
                {pr.name}
              </option>
            ))}
          </select>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
                <th className="p-3">Tgl Input</th>
                <th className="p-3">Nama Calon User</th>
                <th className="p-3">No. HP / WA</th>
                <th className="p-3">Sumber Leads</th>
                <th className="p-3">Status</th>
                <th className="p-3">Proyek Diminati</th>
                <th className="p-3">Marketing Inputter</th>
                <th className="p-3">Lokasi GPS Pertemuan</th>
                <th className="p-3">Janji Follow Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada database prospek yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredProspects.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{p.createdAt}</td>
                    <td className="p-3 font-black text-slate-900">{p.name}</td>
                    <td className="p-3 whitespace-nowrap font-mono text-emerald-600 font-bold">
                      <a href={`https://wa.me/62${p.phone.replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {p.phone}
                      </a>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block">{p.source}</span>
                      {p.source === 'Referensi' && p.sourceReferenceDetail && (
                        <span className="text-[10px] text-amber-700 italic block">{p.sourceReferenceDetail}</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 border border-slate-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{p.projectNameInterest || '-'}</td>
                    <td className="p-3 font-extrabold text-indigo-700 whitespace-nowrap">{p.agentName}</td>
                    <td className="p-3 text-[11px]">
                      <span className="font-bold text-slate-800 block truncate max-w-[150px]">{p.locationName || 'Galeri Proyek'}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[150px]">{p.locationAddress}</span>
                    </td>
                    <td className="p-3 text-[11px] whitespace-nowrap font-bold text-purple-700">
                      {p.nextFollowUpDate ? `${p.nextFollowUpDate} (${p.nextFollowUpType || 'Janji'})` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
