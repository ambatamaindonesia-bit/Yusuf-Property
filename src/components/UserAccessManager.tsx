import React, { useState } from 'react';
import { AppUser, UserRole, MarketingType, TabType, ALL_TAB_ITEMS, DEFAULT_ROLE_TABS, getUserAllowedTabs } from '../types';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  UserCheck,
  Check,
} from 'lucide-react';

interface UserAccessManagerProps {
  users: AppUser[];
  currentUser: AppUser | null;
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserAccessManager: React.FC<UserAccessManagerProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Sales Marketing');
  const [marketingType, setMarketingType] = useState<MarketingType>('Inhouse');
  const [agencyName, setAgencyName] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [notes, setNotes] = useState('');
  const [allowedTabs, setAllowedTabs] = useState<TabType[]>(DEFAULT_ROLE_TABS['Sales Marketing']);

  // Admin Security Check
  if (currentUser?.role !== 'Super Admin') {
    return (
      <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-md text-center max-w-md mx-auto space-y-4 my-12 animate-in fade-in">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Akses Terbatas (Admin Only)</h2>
          <p className="text-xs text-slate-600 leading-relaxed mt-1">
            Menu <strong>Kelola Akses User ERP</strong> hanya dapat diakses oleh pengguna dengan role <strong>Super Admin</strong>.
          </p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
          🔒 Anda login sebagai: <strong>{currentUser?.name || 'User'}</strong> ({currentUser?.role})
        </div>
      </div>
    );
  }

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Aktif').length;
  const inactiveUsers = users.filter((u) => u.status === 'Nonaktif').length;
  const adminUsers = users.filter((u) => u.role === 'Super Admin').length;

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;

    return true;
  });

  const resetForm = () => {
    setUsername('');
    setPassword('123456');
    setShowPassword(false);
    setName('');
    setEmail('');
    setPhone('');
    setRole('Sales Marketing');
    setMarketingType('Inhouse');
    setAgencyName('');
    setStatus('Aktif');
    setNotes('');
    setAllowedTabs(DEFAULT_ROLE_TABS['Sales Marketing']);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const defaults = DEFAULT_ROLE_TABS[newRole] || DEFAULT_ROLE_TABS['Sales Marketing'];
    setAllowedTabs(defaults);
  };

  const handleToggleTab = (tabId: TabType) => {
    if (tabId === 'user_access' && role !== 'Super Admin') return;

    if (allowedTabs.includes(tabId)) {
      setAllowedTabs(allowedTabs.filter((t) => t !== tabId));
    } else {
      setAllowedTabs([...allowedTabs, tabId]);
    }
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (u: AppUser) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password || '123456');
    setShowPassword(false);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setRole(u.role);
    setMarketingType(u.marketingType);
    setAgencyName(u.agencyName || '');
    setStatus(u.status);
    setNotes(u.notes || '');
    setAllowedTabs(getUserAllowedTabs(u));
  };

  const handleToggleStatus = (u: AppUser) => {
    const updatedStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    onUpdateUser({
      ...u,
      status: updatedStatus,
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name) return;

    // Filter allowed tabs to ensure user_access is only kept if Super Admin
    const finalAllowedTabs = role === 'Super Admin' 
      ? allowedTabs 
      : allowedTabs.filter((t) => t !== 'user_access');

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
        status,
        notes,
        allowedTabs: finalAllowedTabs,
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
        status,
        notes,
        allowedTabs: finalAllowedTabs,
      };
      onAddUser(newUser);
      setShowAddModal(false);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-extrabold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Kelola Pengguna & Hak Akses ERP
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Atur otorisasi login, ubah role akun, kelola password, serta aktifkan/nonaktifkan akses masuk pengguna ke sistem.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Akses Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Akun Terdaftar</span>
            <span className="text-2xl font-black text-slate-900">{totalUsers} User</span>
          </div>
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Akses Aktif</span>
            <span className="text-2xl font-black text-emerald-900">{activeUsers} User</span>
            <span className="text-[10px] text-emerald-600 font-medium block">Dapat Login Ke Sistem</span>
          </div>
          <div className="p-2 bg-emerald-200/60 text-emerald-800 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-700 block">Akses Nonaktif</span>
            <span className="text-2xl font-black text-rose-900">{inactiveUsers} User</span>
            <span className="text-[10px] text-rose-600 font-medium block">Akses Login Ditolak</span>
          </div>
          <div className="p-2 bg-rose-200/60 text-rose-800 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-indigo-700 block">Super Admin</span>
            <span className="text-2xl font-black text-indigo-900">{adminUsers} User</span>
            <span className="text-[10px] text-indigo-600 font-medium block">Otoritas Penuh</span>
          </div>
          <div className="p-2 bg-indigo-200/60 text-indigo-800 rounded-xl">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari username, nama, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
          >
            <option value="ALL">Semua Role</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Manager Marketing">Manager Marketing</option>
            <option value="Sales Marketing">Sales Marketing</option>
            <option value="Finance & Kasir">Finance & Kasir</option>
            <option value="Legal & Sertifikat">Legal & Sertifikat</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif Saja</option>
            <option value="Nonaktif">Nonaktif Saja</option>
          </select>
        </div>

      </div>

      {/* Access Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Daftar Akses Pengguna ERP ({filteredUsers.length})</span>
          </span>
          <span className="text-[11px] text-slate-500 font-normal">Sistem Keamanan Otorisasi Pengguna</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            Tidak ditemukan pengguna yang sesuai dengan kriteria filter. Silakan tambah pengguna baru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <th className="p-3.5">Akun Pengguna</th>
                  <th className="p-3.5">Username Login</th>
                  <th className="p-3.5">Role Otorisasi ERP</th>
                  <th className="p-3.5">Hak Akses Menu ({ALL_TAB_ITEMS.length})</th>
                  <th className="p-3.5">Status Akses</th>
                  <th className="p-3.5 text-right">Kelola Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const userTabs = getUserAllowedTabs(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & Contact */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-black rounded">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{u.email || '-'} • {u.phone || '-'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="p-3.5 font-mono font-bold text-amber-800 bg-amber-50/30 rounded">
                        @{u.username}
                      </td>

                      {/* Role */}
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                            u.role === 'Super Admin'
                              ? 'bg-purple-100 text-purple-900 border-purple-200'
                              : u.role === 'Manager Marketing'
                              ? 'bg-blue-100 text-blue-900 border-blue-200'
                              : u.role === 'Finance & Kasir'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {u.role}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {u.marketingType === 'Inhouse'
                            ? 'Inhouse Marketing'
                            : u.marketingType === 'Agent'
                            ? `Broker (${u.agencyName || 'Eksternal'})`
                            : 'Staff ERP'}
                        </div>
                      </td>

                      {/* Allowed Menu Badges */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {userTabs.map((tabId) => {
                            const tabInfo = ALL_TAB_ITEMS.find((t) => t.id === tabId);
                            return (
                              <span
                                key={tabId}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                  tabId === 'user_access'
                                    ? 'bg-purple-100 border-purple-300 text-purple-900'
                                    : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                {tabInfo?.label.replace(' Overview', '').replace(' (SPR)', '')}
                              </span>
                            );
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                          Total {userTabs.length} dari {ALL_TAB_ITEMS.length} Menu Diizinkan
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition-all ${
                            u.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                          }`}
                          title="Klik untuk mengubah status akses"
                        >
                          {u.status === 'Aktif' ? (
                            <>
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-rose-600" />
                              <span>Diblokir</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Edit Pengguna"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeletingUser(u)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Hapus Akses Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
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

      {/* Modal Hapus User Access */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-rose-950 p-4 text-white flex justify-between items-center">
              <span className="font-extrabold text-sm text-rose-200 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Hapus Hak Akses Pengguna ERP
              </span>
              <button
                onClick={() => setDeletingUser(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                <div className="font-bold">⚠️ Apakah Anda yakin ingin menghapus user ini?</div>
                <div className="text-[11px] text-rose-800">
                  User: <strong>"{deletingUser.name}"</strong> (@{deletingUser.username}) dengan role <strong>{deletingUser.role}</strong> tidak akan bisa login lagi ke sistem ERP.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-md"
                >
                  Ya, Hapus Akses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add & Edit User Access */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-extrabold text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                {editingUser ? 'Edit Hak Akses Pengguna' : 'Tambah Pengguna Akses ERP Baru'}
              </span>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username Login *</label>
                  <input
                    type="text"
                    placeholder="misal: admin.pemasaran"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password Login *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Pengguna *</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso, S.E."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@yusufproperty.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Akses ERP</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl font-extrabold text-amber-950"
                  >
                    <option value="Super Admin">Super Admin (Akses Penuh)</option>
                    <option value="Manager Marketing">Manager Marketing</option>
                    <option value="Sales Marketing">Sales Marketing</option>
                    <option value="Finance & Kasir">Finance & Kasir</option>
                    <option value="Legal & Sertifikat">Legal & Sertifikat</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Akses Login</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className={`w-full p-2.5 border rounded-xl font-bold ${
                      status === 'Aktif'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <option value="Aktif">Aktif (Dapat Login)</option>
                    <option value="Nonaktif">Nonaktif (Akses Diblokir)</option>
                  </select>
                </div>
              </div>

              {/* Menu Access Permissions Selector */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>Pilihan Hak Akses Menu ERP ({allowedTabs.length} Diizinkan) *</span>
                  </label>
                  <div className="flex gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        const all = ALL_TAB_ITEMS.map((i) => i.id).filter(
                          (id) => id !== 'user_access' || role === 'Super Admin'
                        );
                        setAllowedTabs(all);
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded transition-colors"
                    >
                      Centang Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllowedTabs(['dashboard'])}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded transition-colors"
                    >
                      Dashboard Saja
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const defaults = DEFAULT_ROLE_TABS[role] || DEFAULT_ROLE_TABS['Sales Marketing'];
                        setAllowedTabs(role === 'Super Admin' ? defaults : defaults.filter((t) => t !== 'user_access'));
                      }}
                      className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded transition-colors"
                    >
                      Preset Role
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Centang menu apa saja yang disetujui oleh admin untuk dapat diakses oleh user ini saat login.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {ALL_TAB_ITEMS.map((item) => {
                    const isChecked = allowedTabs.includes(item.id);
                    const isDisabled = item.superAdminOnly && role !== 'Super Admin';
                    return (
                      <div
                        key={item.id}
                        onClick={() => !isDisabled && handleToggleTab(item.id)}
                        className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-all select-none ${
                          isDisabled
                            ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                            : isChecked
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-xs cursor-pointer'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            readOnly
                            className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold leading-tight flex items-center justify-between gap-1">
                            <span className="truncate">{item.label}</span>
                            {item.superAdminOnly && (
                              <span className="px-1 py-0.2 bg-purple-100 text-purple-900 text-[8px] font-black rounded flex-shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Pengguna</label>
                  <select
                    value={marketingType}
                    onChange={(e) => setMarketingType(e.target.value as MarketingType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Inhouse">Marketing Inhouse</option>
                    <option value="Agent">Agent Broker (Freelance)</option>
                    <option value="-">Staff Operasional ERP</option>
                  </select>
                </div>

                {marketingType === 'Agent' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Agency Broker</label>
                    <input
                      type="text"
                      placeholder="Nama Kantor Agent"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full p-2 bg-blue-50 border border-blue-200 rounded-xl font-bold text-blue-900"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-semibold rounded-xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md"
                >
                  {editingUser ? 'Simpan Perubahan Akses' : 'Buat Akses Pengguna'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
