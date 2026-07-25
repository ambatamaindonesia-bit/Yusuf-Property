import React, { useState } from 'react';
import { AppUser, UserRole, MarketingType, SalesTransaction } from '../types';
import { Users, UserPlus, Search, Edit3, Trash2 } from 'lucide-react';

interface EmployeeMarketingManagerProps {
  users: AppUser[];
  sales: SalesTransaction[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const EmployeeMarketingManager: React.FC<EmployeeMarketingManagerProps> = ({
  users,
  sales,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Inhouse' | 'Agent' | 'Staff'>('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Sales Marketing');
  const [marketingType, setMarketingType] = useState<MarketingType>('Inhouse');
  const [agencyName, setAgencyName] = useState('');
  const [commissionRatePercent, setCommissionRatePercent] = useState<number>(2.5);
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [notes, setNotes] = useState('');

  // Calculate stats
  const totalEmployees = users.length;
  const inhouseCount = users.filter((u) => u.marketingType === 'Inhouse').length;
  const agentCount = users.filter((u) => u.marketingType === 'Agent').length;
  const staffCount = users.filter((u) => u.marketingType === '-').length;

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.agencyName && u.agencyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (typeFilter === 'Inhouse') return u.marketingType === 'Inhouse';
    if (typeFilter === 'Agent') return u.marketingType === 'Agent';
    if (typeFilter === 'Staff') return u.marketingType === '-';
    return true;
  });

  // Calculate closing count for each marketing agent
  const getClosingCount = (userName: string) => {
    return sales.filter((s) => s.marketingAgent.toLowerCase().includes(userName.toLowerCase())).length;
  };

  const resetForm = () => {
    setUsername('');
    setPassword('123');
    setName('');
    setEmail('');
    setPhone('');
    setRole('Sales Marketing');
    setMarketingType('Inhouse');
    setAgencyName('');
    setCommissionRatePercent(2.5);
    setStatus('Aktif');
    setNotes('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (u: AppUser) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password || '123');
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setRole(u.role);
    setMarketingType(u.marketingType);
    setAgencyName(u.agencyName || '');
    setCommissionRatePercent(u.commissionRatePercent || 2.5);
    setStatus(u.status);
    setNotes(u.notes || '');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name) return;

    if (editingUser) {
      const updated: AppUser = {
        ...editingUser,
        username,
        password,
        name,
        email,
        phone,
        role,
        marketingType,
        agencyName: marketingType === 'Agent' ? agencyName : marketingType === 'Inhouse' ? 'PT Yusuf Property (Inhouse)' : undefined,
        commissionRatePercent,
        status,
        notes,
      };
      onUpdateUser(updated);
      setEditingUser(null);
    } else {
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        username,
        password,
        name,
        email,
        phone,
        role,
        marketingType,
        agencyName: marketingType === 'Agent' ? agencyName : marketingType === 'Inhouse' ? 'PT Yusuf Property (Inhouse)' : undefined,
        commissionRatePercent,
        status,
        notes,
      };
      onAddUser(newUser);
      setShowAddModal(false);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Manajemen Karyawan, Marketing & User ERP</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan data tim Marketing Inhouse, Agent Broker Eksternal, dan Hak Akses Pengguna ERP.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User / Marketing Baru</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total User & Karyawan</span>
          <span className="text-2xl font-black text-slate-900">{totalEmployees} Orang</span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block">Marketing Inhouse</span>
          <span className="text-2xl font-black text-emerald-900">{inhouseCount} Orang</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">Karyawan Tetap Developer</span>
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-blue-700 block">Marketing Agent Broker</span>
          <span className="text-2xl font-black text-blue-900">{agentCount} Orang</span>
          <span className="text-[10px] text-blue-600 font-semibold block">Freelance / Partner Agency</span>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-amber-400 block">Staff ERP Non-Marketing</span>
          <span className="text-2xl font-black text-white">{staffCount} Orang</span>
          <span className="text-[10px] text-slate-400 font-semibold block">Admin, Legal & Finance</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari nama, username, agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'Inhouse', 'Agent', 'Staff'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                typeFilter === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'Semua' : type === 'Staff' ? 'Staff ERP' : `Marketing ${type}`}
            </button>
          ))}
        </div>

      </div>

      {/* Users Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>Daftar User & Marketing ({filteredUsers.length})</span>
          <span className="text-[11px] text-slate-500 font-normal">Sistem Otorisasi Access Role</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Belum ada data user atau marketing yang sesuai pencarian. Silakan klik "Tambah User / Marketing Baru".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <th className="p-3.5">Pengguna / Marketing</th>
                  <th className="p-3.5">Role Akses ERP</th>
                  <th className="p-3.5">Tipe Marketing</th>
                  <th className="p-3.5">Agency / Perusahaan</th>
                  <th className="p-3.5">Komisi</th>
                  <th className="p-3.5">Total Closing</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredUsers.map((u) => {
                  const closingCount = getClosingCount(u.name);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-black text-[11px] flex items-center justify-center">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">@{u.username} • {u.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {u.marketingType === 'Inhouse' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            🏢 Inhouse
                          </span>
                        ) : u.marketingType === 'Agent' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            🤝 Agent Broker
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      <td className="p-3.5 font-medium text-slate-800">
                        {u.agencyName || '-'}
                      </td>

                      <td className="p-3.5 font-bold text-amber-600">
                        {u.commissionRatePercent ? `${u.commissionRatePercent}%` : '-'}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold">
                          {closingCount} SPR
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-rose-950 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm text-rose-200">Konfirmasi Hapus User / Marketing</span>
              <button
                onClick={() => setDeletingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                ⚠️ Apakah Anda yakin ingin menghapus user/marketing <strong>"{deletingUser.name}"</strong>?
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteUser(deletingUser.id);
                    setDeletingUser(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  Ya, Hapus User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm">
                {editingUser ? 'Edit User / Marketing' : 'Tambah User / Marketing Baru'}
              </span>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username Login</label>
                  <input
                    type="text"
                    placeholder="misal: rian.mkt"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Prasetya, S.E."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Akses ERP</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Manager Marketing">Manager Marketing</option>
                    <option value="Sales Marketing">Sales Marketing</option>
                    <option value="Finance & Kasir">Finance & Kasir</option>
                    <option value="Legal & Sertifikat">Legal & Sertifikat</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Marketing</label>
                  <select
                    value={marketingType}
                    onChange={(e) => setMarketingType(e.target.value as MarketingType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-700"
                  >
                    <option value="Inhouse">Inhouse (Tetap Developer)</option>
                    <option value="Agent">Agent Broker (Freelance)</option>
                    <option value="-">- (Bukan Marketing)</option>
                  </select>
                </div>
              </div>

              {marketingType === 'Agent' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Perusahaan / Agency Broker</label>
                  <input
                    type="text"
                    placeholder="Contoh: Era Yusuf Property Agency / Freelance"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg font-bold text-blue-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Persentase Komisi (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRatePercent}
                    onChange={(e) => setCommissionRatePercent(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Akun</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah User Baru'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
