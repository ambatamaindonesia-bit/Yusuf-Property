import React, { useState, useMemo } from 'react';
import { FinancialRecord, TransactionAuditLog, AppUser } from '../types';
import { formatDate, formatRupiah } from '../utils/formatters';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Search,
  Edit3,
  Trash2,
  History,
  AlertTriangle,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';

interface FinanceManagerProps {
  finances: FinancialRecord[];
  onAddFinanceRecord: (record: FinancialRecord) => void;
  onUpdateFinanceRecord?: (record: FinancialRecord) => void;
  onDeleteFinanceRecord?: (id: string, reason: string, user: string) => void;
  currentUser?: AppUser | null;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({
  finances,
  onAddFinanceRecord,
  onUpdateFinanceRecord,
  onDeleteFinanceRecord,
  currentUser,
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('active');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Modals for Edit, Delete & Audit History
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [editReason, setEditReason] = useState<string>('');

  const [deletingRecord, setDeletingRecord] = useState<FinancialRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');

  const [auditRecord, setAuditRecord] = useState<FinancialRecord | null>(null);

  // New Record Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(5000000);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<any>('dp_pembayaran');
  const [projectName, setProjectName] = useState('Grand Yusuf Residence');
  const [unitCode, setUnitCode] = useState('A-02');
  const [paymentMethod, setPaymentMethod] = useState<string>('Transfer Bank BCA');
  const [payerName, setPayerName] = useState('');
  const [payerRelationship, setPayerRelationship] = useState('Konsumen Langsung (Pribadi)');

  // Active (non-deleted) records for calculation
  const activeFinances = useMemo(() => finances.filter((f) => !f.isDeleted), [finances]);

  // Unique month keys in dataset (e.g. ['2026-07', '2026-06', ...])
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    const nowKey = new Date().toISOString().slice(0, 7);
    monthSet.add(nowKey);
    finances.forEach((f) => {
      if (f.date && f.date.length >= 7) {
        monthSet.add(f.date.slice(0, 7));
      }
    });
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [finances]);

  const formatMonthLabel = (mKey: string) => {
    if (mKey === 'all') return 'Semua Periode Transaksi';
    const [year, month] = mKey.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIdx = parseInt(month, 10) - 1;
    return `${monthNames[monthIdx] || month} ${year}`;
  };

  // Saldo Awal Bulan (Balance of all active records before start of selectedMonthKey)
  const saldoAwalBulan = useMemo(() => {
    if (selectedMonthKey === 'all') return 0;
    const startOfMonth = `${selectedMonthKey}-01`;
    return activeFinances
      .filter((f) => f.date < startOfMonth)
      .reduce((acc, curr) => acc + (curr.type === 'income' ? curr.amount : -curr.amount), 0);
  }, [activeFinances, selectedMonthKey]);

  // Active records for current month filter
  const currentMonthFinances = useMemo(() => {
    if (selectedMonthKey === 'all') {
      return [...activeFinances].sort((a, b) => a.date.localeCompare(b.date));
    }
    return activeFinances
      .filter((f) => f.date.startsWith(selectedMonthKey))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [activeFinances, selectedMonthKey]);

  // Monthly totals
  const totalIncomeMonth = useMemo(() => {
    return currentMonthFinances
      .filter((f) => f.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentMonthFinances]);

  const totalExpenseMonth = useMemo(() => {
    return currentMonthFinances
      .filter((f) => f.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentMonthFinances]);

  // Saldo Akhir Bulan Ini (Will become Saldo Awal next month)
  const saldoAkhirBulan = saldoAwalBulan + totalIncomeMonth - totalExpenseMonth;

  // Overall total net balance
  const totalIncomeAll = activeFinances
    .filter((f) => f.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenseAll = activeFinances
    .filter((f) => f.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalanceAll = totalIncomeAll - totalExpenseAll;

  // Running balance calculation for display table (chronological order)
  const displayFinancesWithRunningBalance = useMemo(() => {
    if (filterType === 'deleted') {
      return finances.filter((f) => f.isDeleted).map((f) => ({ record: f, runningBalance: 0 }));
    }

    let baseList = currentMonthFinances;
    if (filterType === 'income') {
      baseList = baseList.filter((f) => f.type === 'income');
    } else if (filterType === 'expense') {
      baseList = baseList.filter((f) => f.type === 'expense');
    }

    let running = saldoAwalBulan;
    return baseList.map((f) => {
      if (f.type === 'income') {
        running += f.amount;
      } else {
        running -= f.amount;
      }
      return {
        record: f,
        runningBalance: running,
      };
    });
  }, [currentMonthFinances, filterType, finances, saldoAwalBulan]);

  // Handle create new record
  const handleSubmitNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    const recordedBy = currentUser?.name || 'Admin Keuangan Yusuf Property';
    const nowStr = new Date().toLocaleString('id-ID');

    const initialAuditLog: TransactionAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      action: 'CREATE',
      user: recordedBy,
      reason: 'Pencatatan awal transaksi kas baru',
      changesSummary: `Penambahan transaksi nominal ${formatRupiah(amount)}`,
    };

    const newRecord: FinancialRecord = {
      id: `fin-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      title,
      amount,
      projectName,
      unitCode,
      paymentMethod,
      payerName: payerName.trim() || undefined,
      payerRelationship,
      refNumber: `TRF/YP/${Date.now().toString().slice(-4)}`,
      recordedBy,
      auditLogs: [initialAuditLog],
    };

    onAddFinanceRecord(newRecord);
    setShowAddModal(false);
    setTitle('');
    setPayerName('');
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: FinancialRecord) => {
    setEditingRecord({ ...rec });
    setEditReason('');
  };

  // Save Edit Record
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editReason.trim()) return;

    const userName = currentUser?.name || 'Admin Keuangan Yusuf Property';
    const nowStr = new Date().toLocaleString('id-ID');

    // Find original
    const original = finances.find((f) => f.id === editingRecord.id);
    let summaryText = 'Pembaruan data transaksi';
    if (original && original.amount !== editingRecord.amount) {
      summaryText = `Nominal diubah dari ${formatRupiah(original.amount)} menjadi ${formatRupiah(editingRecord.amount)}`;
    } else if (original && original.title !== editingRecord.title) {
      summaryText = `Keterangan diubah dari "${original.title}" menjadi "${editingRecord.title}"`;
    }

    const newAuditLog: TransactionAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      action: 'EDIT',
      user: userName,
      reason: editReason.trim(),
      changesSummary: summaryText,
    };

    const updatedAuditLogs = original?.auditLogs
      ? [...original.auditLogs, newAuditLog]
      : [newAuditLog];

    const updatedRecord: FinancialRecord = {
      ...editingRecord,
      auditLogs: updatedAuditLogs,
    };

    if (onUpdateFinanceRecord) {
      onUpdateFinanceRecord(updatedRecord);
    }
    setEditingRecord(null);
    setEditReason('');
  };

  // Open Delete Confirmation
  const handleOpenDelete = (rec: FinancialRecord) => {
    setDeletingRecord(rec);
    setDeleteReason('');
  };

  // Confirm Soft Delete
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingRecord || !deleteReason.trim()) return;

    const userName = currentUser?.name || 'Admin Keuangan Yusuf Property';
    const nowStr = new Date().toLocaleString('id-ID');

    const deleteAuditLog: TransactionAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      action: 'DELETE',
      user: userName,
      reason: deleteReason.trim(),
      changesSummary: `Transaksi senilai ${formatRupiah(deletingRecord.amount)} dihapus dari jurnal aktif.`,
    };

    const updatedAuditLogs = deletingRecord.auditLogs
      ? [...deletingRecord.auditLogs, deleteAuditLog]
      : [deleteAuditLog];

    const deletedRecord: FinancialRecord = {
      ...deletingRecord,
      isDeleted: true,
      deletedAt: nowStr,
      deletedBy: userName,
      deleteReason: deleteReason.trim(),
      auditLogs: updatedAuditLogs,
    };

    if (onUpdateFinanceRecord) {
      onUpdateFinanceRecord(deletedRecord);
    } else if (onDeleteFinanceRecord) {
      onDeleteFinanceRecord(deletingRecord.id, deleteReason.trim(), userName);
    }

    setDeletingRecord(null);
    setDeleteReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Jurnal Keuangan ERP & Audit Perubahan Transaksi</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catat arus kas proyek perumahan lengkap dengan fitur Edit, Hapus, dan Riwayat Audit History perubahan.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Transaksi Kas Baru</span>
        </button>
      </div>

      {/* Financial Summary Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Awal Bulan Sebelumnya */}
        <div className="bg-slate-800 text-white p-4.5 rounded-2xl border border-slate-700 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Saldo Bulan Sebelumnya</span>
            <div className="p-1.5 bg-amber-400/20 text-amber-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {formatRupiah(saldoAwalBulan)}
          </div>
          <p className="text-[11px] text-slate-400">
            Saldo awal {formatMonthLabel(selectedMonthKey)}
          </p>
        </div>

        {/* Total Incomes */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Cash In (Pemasukan)</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
            {formatRupiah(totalIncomeMonth)}
          </div>
          <p className="text-[11px] text-slate-500">
            {selectedMonthKey === 'all' ? 'Total penerimaan kas' : `Pemasukan ${formatMonthLabel(selectedMonthKey)}`}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Cash Out (Pengeluaran)</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight">
            {formatRupiah(totalExpenseMonth)}
          </div>
          <p className="text-[11px] text-slate-500">
            {selectedMonthKey === 'all' ? 'Total pengeluaran kas' : `Pengeluaran ${formatMonthLabel(selectedMonthKey)}`}
          </p>
        </div>

        {/* Saldo Akhir Bulan Ini */}
        <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Saldo Akhir Bulan Ini</span>
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            {formatRupiah(saldoAkhirBulan)}
          </div>
          <p className="text-[10px] text-amber-300 font-medium">
            ✨ Otomatis jadi Saldo Awal bulan berikutnya
          </p>
        </div>
      </div>

      {/* Finance Filter & Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Jurnal Transaksi Kas Proyek & Saldo Running</h3>
            <p className="text-[11px] text-slate-400">
              Saldo otomatis menyesuaikan dari saldo bulan sebelumnya dan riwayat cash in/out.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="bg-transparent font-extrabold text-xs text-slate-800 focus:outline-none pr-2 cursor-pointer"
              >
                <option value="all">Semua Periode</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter Tabs */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterType('active')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                  filterType === 'active'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Aktif ({currentMonthFinances.length})
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                  filterType === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                  filterType === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Pengeluaran
              </button>
              <button
                onClick={() => setFilterType('deleted')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                  filterType === 'deleted'
                    ? 'bg-rose-900 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Hapus ({finances.filter((f) => f.isDeleted).length})
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3 rounded-tl-xl">Tanggal / Ref</th>
                <th className="p-3">Keterangan Transaksi</th>
                <th className="p-3">Proyek / Unit</th>
                <th className="p-3">Metode & Pengirim</th>
                <th className="p-3 text-right">Cash In / Out</th>
                <th className="p-3 text-right bg-slate-800 text-amber-400">Saldo Akumulasi</th>
                <th className="p-3 text-center rounded-tr-xl">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              
              {/* Row 1: Saldo Bulan Sebelumnya (Opening Balance) */}
              {filterType !== 'deleted' && (
                <tr className="bg-amber-50/70 border-b-2 border-amber-200/80 font-bold">
                  <td className="p-3 text-amber-900 font-mono">
                    {selectedMonthKey === 'all' ? 'Awal' : `${selectedMonthKey}-01`}
                  </td>
                  <td className="p-3 text-amber-900" colSpan={3}>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-black rounded text-[10px]">
                        SALDO AWAL
                      </span>
                      <span>
                        Saldo Sisa Bulan Sebelumnya ({selectedMonthKey === 'all' ? 'Baseline Operasional' : formatMonthLabel(selectedMonthKey)})
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-slate-400 italic font-normal">
                    -
                  </td>
                  <td className="p-3 text-right font-black text-amber-900 text-sm bg-amber-100/50">
                    {formatRupiah(saldoAwalBulan)}
                  </td>
                  <td className="p-3 text-center text-[10px] text-amber-700 italic">
                    Carry-over
                  </td>
                </tr>
              )}

              {displayFinancesWithRunningBalance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada transaksi pada filter periode ini.
                  </td>
                </tr>
              ) : (
                displayFinancesWithRunningBalance.map(({ record: f, runningBalance }) => (
                  <tr
                    key={f.id}
                    className={`transition-colors ${
                      f.isDeleted ? 'bg-rose-50/40 text-slate-400 italic line-through' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{formatDate(f.date)}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{f.refNumber}</div>
                    </td>

                    <td className="p-3 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {f.type === 'income' ? (
                          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        )}
                        <span className={f.isDeleted ? 'line-through text-slate-400' : ''}>{f.title}</span>
                      </div>
                      {f.isDeleted && (
                        <div className="text-[10px] text-rose-600 not-italic font-bold mt-0.5">
                          [DIHAPUS]: {f.deleteReason} (oleh {f.deletedBy})
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{f.projectName}</div>
                      {f.unitCode && <div className="text-[10px] text-amber-600 font-bold">Blok {f.unitCode}</div>}
                    </td>

                    <td className="p-3 font-medium text-slate-600">
                      <div className="font-semibold text-slate-800">{f.paymentMethod}</div>
                      {f.payerName && (
                        <div className="text-[10px] text-slate-500">
                          a.n. <strong className="text-slate-700">{f.payerName}</strong> ({f.payerRelationship || 'Pribadi'})
                        </div>
                      )}
                    </td>

                    <td
                      className={`p-3 text-right font-black text-sm ${
                        f.isDeleted ? 'text-slate-400 line-through' : f.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {f.type === 'income' ? '+' : '-'}{formatRupiah(f.amount)}
                    </td>

                    <td className="p-3 text-right font-black text-sm text-slate-900 bg-slate-50/50">
                      {f.isDeleted ? '-' : formatRupiah(runningBalance)}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Audit History Log Button */}
                        <button
                          onClick={() => setAuditRecord(f)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all relative"
                          title="Lihat Riwayat History Audit"
                        >
                          <History className="w-4 h-4" />
                          {f.auditLogs && f.auditLogs.length > 1 && (
                            <span className="absolute -top-1 -right-1 px-1 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full">
                              {f.auditLogs.length}
                            </span>
                          )}
                        </button>

                        {!f.isDeleted && (
                          <>
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(f)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all"
                              title="Edit Transaksi (Wajib Alasan)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleOpenDelete(f)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-all"
                              title="Hapus Transaksi (Wajib Alasan)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {/* Row Final: Saldo Akhir Bulan Ini (Menjadi Saldo Awal Bulan Berikutnya) */}
              {filterType !== 'deleted' && (
                <tr className="bg-slate-900 text-white font-extrabold border-t-2 border-slate-700">
                  <td className="p-3 text-amber-400 font-mono">Akhir</td>
                  <td className="p-3" colSpan={3}>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded text-[10px]">
                        SALDO AKHIR
                      </span>
                      <span className="text-slate-200">
                        Saldo Akhir {formatMonthLabel(selectedMonthKey)} — Otomatis Menjadi Saldo Awal Bulan Berikutnya
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-xs">
                    <span className="text-emerald-400">+{formatRupiah(totalIncomeMonth)}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-rose-400">-{formatRupiah(totalExpenseMonth)}</span>
                  </td>
                  <td className="p-3 text-right font-black text-amber-400 text-base bg-slate-800">
                    {formatRupiah(saldoAkhirBulan)}
                  </td>
                  <td className="p-3 text-center text-[10px] text-amber-300">
                    ✨ Final
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Catat Transaksi Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm">Catat Transaksi Kas Baru</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitNewRecord} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Transaksi</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="income">Pemasukan (+)</option>
                    <option value="expense">Pengeluaran (-)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembayaran DP Unit A-02 / Pembelian Semen"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proyek</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Metode Bayar</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                    <option value="Transfer Bank BTN">Transfer Bank BTN</option>
                    <option value="Transfer Bank BSI">Transfer Bank BSI</option>
                    <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                    <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                    <option value="Cash / Tunai">Cash / Tunai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                <div>
                  <label className="font-bold text-amber-900 block mb-1">Pembayaran Atas Nama</label>
                  <input
                    type="text"
                    placeholder="Nama pemilik rekening / pengirim"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-900 block mb-1">Hubungan Pengirim</label>
                  <select
                    value={payerRelationship}
                    onChange={(e) => setPayerRelationship(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="Konsumen Langsung (Pribadi)">Konsumen Langsung (Pribadi)</option>
                    <option value="Pasangan (Suami / Istri)">Pasangan (Suami / Istri)</option>
                    <option value="Orang Tua / Anak">Orang Tua / Anak</option>
                    <option value="Perusahaan / PT">Perusahaan / PT</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Transaksi & Record History Reason */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" /> Edit Transaksi (Wajib Alasan Perubahan)
              </span>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Setiap perubahan data transaksi akan tercatat permanent di audit history sistem ERP.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nominal Baru (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={editingRecord.amount}
                    onChange={(e) => setEditingRecord({ ...editingRecord, amount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-amber-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Metode Bayar</label>
                  <input
                    type="text"
                    value={editingRecord.paymentMethod}
                    onChange={(e) => setEditingRecord({ ...editingRecord, paymentMethod: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Judul Transaksi *</label>
                <input
                  type="text"
                  required
                  value={editingRecord.title}
                  onChange={(e) => setEditingRecord({ ...editingRecord, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pembayaran Atas Nama</label>
                  <input
                    type="text"
                    value={editingRecord.payerName || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, payerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proyek / Unit</label>
                  <input
                    type="text"
                    value={editingRecord.unitCode || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, unitCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* MANDATORY REASON FIELD */}
              <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5">
                <label className="font-extrabold text-amber-400 block text-xs">
                  Alasan Perubahan Data Transaksi (WAJIB DIISI) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Koreksi nominal pembayaran KPR dari bank / Perbaikan kuitansi"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-[10px] text-slate-400">*Alasan ini akan tersimpan permanen di jurnal audit auditLog.</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!editReason.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl disabled:opacity-50"
                >
                  Simpan & Record Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Hapus Transaksi & Mandatory Reason */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-rose-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-300" /> Konfirmasi Penghapusan Transaksi Kas
              </span>
              <button onClick={() => setDeletingRecord(null)} className="text-slate-300 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-medium">
                <p className="font-bold">Transaksi yang akan dihapus:</p>
                <p className="text-xs font-black text-rose-950 mt-1">
                  &quot;{deletingRecord.title}&quot; — {formatRupiah(deletingRecord.amount)}
                </p>
                <p className="text-[10px] text-rose-700 mt-1">Ref: {deletingRecord.refNumber}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-900 block">
                  Alasan Penghapusan Transaksi (WAJIB DIISI) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Transaksi ganda / Pembatalan akad oleh konsumen / Terjadi kesalahan penginputan nominal"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingRecord(null)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!deleteReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl disabled:opacity-50"
                >
                  Hapus & Record History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Audit Log History Trail View */}
      {auditRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <div>
                <span className="font-bold text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" /> Audit History & Jejak Perubahan Transaksi
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {auditRecord.refNumber}</p>
              </div>
              <button onClick={() => setAuditRecord(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-900">{auditRecord.title}</p>
                <p className="text-sm font-black text-emerald-700">{formatRupiah(auditRecord.amount)}</p>
                <p className="text-[10px] text-slate-500">
                  Proyek: {auditRecord.projectName} {auditRecord.unitCode && `(Blok ${auditRecord.unitCode})`}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
                  Timeline Perubahan & Alasan Tindakan
                </h4>

                {!auditRecord.auditLogs || auditRecord.auditLogs.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Belum ada catatan audit log tersimpan.</div>
                ) : (
                  <div className="space-y-2.5 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {auditRecord.auditLogs.map((log) => (
                      <div key={log.id} className="relative pl-8 space-y-1">
                        <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-100"></div>

                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                  log.action === 'CREATE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : log.action === 'EDIT'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {log.action}
                              </span>
                              <span>{log.user}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {log.timestamp}
                            </span>
                          </div>

                          <div className="text-slate-700 pt-0.5">
                            <span className="font-bold text-slate-900">Alasan Tindakan:</span> &quot;{log.reason}&quot;
                          </div>

                          {log.changesSummary && (
                            <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              {log.changesSummary}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setAuditRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
