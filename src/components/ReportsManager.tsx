import React, { useState, useMemo } from 'react';
import { HousingProject, Unit, SalesTransaction, FinancialRecord } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';
import { BarChart3, Download, Printer, FileText, CheckCircle2, Filter, Calendar, Building2, Wallet, Clock } from 'lucide-react';

interface ReportsManagerProps {
  projects: HousingProject[];
  units: Unit[];
  sales: SalesTransaction[];
  finances: FinancialRecord[];
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  projects,
  units,
  sales,
  finances,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'inventory' | 'finance'>('sales');
  
  // Date and Project filters
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  // Filter Sales
  const filteredSales = sales.filter((s) => {
    const matchProject = selectedProjectFilter === 'all' || s.projectName === selectedProjectFilter;
    const matchDate = s.transactionDate >= startDate && s.transactionDate <= endDate;
    return matchProject && matchDate;
  });

  // Filter Units
  const filteredUnits = units.filter((u) => {
    return selectedProjectFilter === 'all' || u.projectName === selectedProjectFilter;
  });

  // Saldo Awal Periode / Bulan Sebelumnya (All active transactions BEFORE startDate)
  const saldoAwalPeriode = useMemo(() => {
    return finances
      .filter((f) => {
        if (f.isDeleted) return false;
        const matchProject = selectedProjectFilter === 'all' || f.projectName === selectedProjectFilter;
        return matchProject && f.date < startDate;
      })
      .reduce((acc, f) => acc + (f.type === 'income' ? f.amount : -f.amount), 0);
  }, [finances, selectedProjectFilter, startDate]);

  // Active finances in current selected period sorted chronologically
  const filteredFinancesSorted = useMemo(() => {
    return finances
      .filter((f) => {
        if (f.isDeleted) return false;
        const matchProject = selectedProjectFilter === 'all' || f.projectName === selectedProjectFilter;
        const matchDate = f.date >= startDate && f.date <= endDate;
        return matchProject && matchDate;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [endDate, finances, selectedProjectFilter, startDate]);

  // Finance list with running balance
  const financesWithRunningBalance = useMemo(() => {
    let currentAccumulated = saldoAwalPeriode;
    return filteredFinancesSorted.map((f) => {
      if (f.type === 'income') {
        currentAccumulated += f.amount;
      } else {
        currentAccumulated -= f.amount;
      }
      return {
        record: f,
        runningBalance: currentAccumulated,
      };
    });
  }, [filteredFinancesSorted, saldoAwalPeriode]);

  // Summary Metrics for Filtered Period
  const totalSalesVolume = filteredSales.reduce((acc, curr) => acc + curr.agreedPrice, 0);
  const totalIncomePeriod = filteredFinancesSorted
    .filter((f) => f.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpensePeriod = filteredFinancesSorted
    .filter((f) => f.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoAkhirPeriode = saldoAwalPeriode + totalIncomePeriod - totalExpensePeriod;

  const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row: any) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
              cell = cell.replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${startDate}_sd_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportCurrent = () => {
    if (activeReportTab === 'sales') {
      const data = filteredSales.map((s) => ({
        'No SPR': s.sprNumber,
        Tanggal: s.transactionDate,
        Proyek: s.projectName,
        Unit: s.unitCode,
        'Nama Pembeli': s.buyer.name,
        'No HP': s.buyer.phone,
        'Skema Pembayaran': s.paymentType,
        'Harga Agreed': s.agreedPrice,
        'Status KPR': s.kprStatus || 'Non-KPR',
        Bank: s.kprBank || '-',
      }));
      exportToCsv('Laporan_Penjualan_Periodik', data);
    } else if (activeReportTab === 'inventory') {
      const data = filteredUnits.map((u) => ({
        Proyek: u.projectName,
        'Blok Unit': u.unitCode,
        Tipe: u.type,
        'Luas Tanah': u.landArea,
        'Luas Bangunan': u.buildingArea,
        'Harga Cash': u.priceCash,
        'Harga KPR': u.priceKpr,
        Status: u.status,
        'Progres %': u.progressPercent,
      }));
      exportToCsv('Laporan_Stok_Kavling_Periodik', data);
    } else {
      const data = [
        {
          Tanggal: startDate,
          'No Ref': 'SALDO AWAL',
          Jenis: 'Awal',
          Kategori: 'CARRY_OVER',
          Keterangan: 'SALDO BULAN SEBELUMNYA (SALDO AWAL PERIODE)',
          Proyek: selectedProjectFilter,
          Nominal: 0,
          'Saldo Akumulasi': saldoAwalPeriode,
          'Metode Bayar': '-',
          'Recorded By': 'System',
        },
        ...financesWithRunningBalance.map(({ record: f, runningBalance }) => ({
          Tanggal: f.date,
          'No Ref': f.refNumber,
          Jenis: f.type,
          Kategori: f.category,
          Keterangan: f.title,
          Proyek: f.projectName,
          Nominal: f.type === 'income' ? f.amount : -f.amount,
          'Saldo Akumulasi': runningBalance,
          'Metode Bayar': f.paymentMethod,
          'Recorded By': f.recordedBy || 'System',
        })),
        {
          Tanggal: endDate,
          'No Ref': 'SALDO AKHIR',
          Jenis: 'Akhir',
          Kategori: 'CARRY_OVER',
          Keterangan: 'SALDO AKHIR PERIODE (MENJADI SALDO AWAL PERIODE BERIKUTNYA)',
          Proyek: selectedProjectFilter,
          Nominal: totalIncomePeriod - totalExpensePeriod,
          'Saldo Akumulasi': saldoAkhirPeriode,
          'Metode Bayar': '-',
          'Recorded By': 'System',
        },
      ];
      exportToCsv('Laporan_Arus_Kas_Periodik', data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable Letterhead Header */}
      <div className="hidden print:block text-slate-900 mb-6 border-b-2 border-slate-900 pb-4">
        <h1 className="text-xl font-black">PT YUSUF PROPERTY INDONESIA</h1>
        <p className="text-xs">LAPORAN MANAJEMEN PERIODIK DEVELOPER PROPERTI</p>
        <p className="text-xs font-semibold mt-1">
          Periode: {formatDate(startDate)} s/d {formatDate(endDate)} | Proyek: {selectedProjectFilter}
        </p>
      </div>

      {/* Main Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl font-extrabold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Laporan Periodik Penjualan & Keuangan ERP</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tarik data laporan penjualan, ketersediaan unit, dan arus kas per periode tanggal & proyek.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCurrent}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Period & Filter Control Card */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Periode Tanggal & Proyek</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tanggal Selesai</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Proyek Perumahan</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="all">Semua Proyek Perumahan</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Omset */}
        <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 shadow-md">
          <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">Omset Penjualan (SPR) Periode Ini</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{formatRupiah(totalSalesVolume)}</p>
          <p className="text-[10px] text-slate-400">{filteredSales.length} Unit Terjual Dalam Periode</p>
        </div>

        {/* Card 2: Saldo Bulan Sebelumnya */}
        <div className="bg-slate-800 text-white p-4.5 rounded-2xl border border-slate-700 shadow-sm">
          <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">Saldo Bulan Sebelumnya</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{formatRupiah(saldoAwalPeriode)}</p>
          <p className="text-[10px] text-slate-400">Saldo awal per {formatDate(startDate)}</p>
        </div>

        {/* Card 3: Realisasi Kas Masuk & Keluar */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Arus Kas Periode Ini</p>
          <div className="text-sm font-black mt-1 space-y-0.5">
            <div className="text-emerald-700">In: +{formatRupiah(totalIncomePeriod)}</div>
            <div className="text-rose-700">Out: -{formatRupiah(totalExpensePeriod)}</div>
          </div>
        </div>

        {/* Card 4: Saldo Akhir Periode */}
        <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 shadow-md">
          <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">Saldo Akhir Periode</p>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{formatRupiah(saldoAkhirPeriode)}</p>
          <p className="text-[10px] text-amber-300">✨ Saldo awal periode berikutnya</p>
        </div>
      </div>

      {/* Report Category Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-extrabold print:hidden">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`pb-3 border-b-2 transition-all ${
            activeReportTab === 'sales'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Laporan Penjualan (SPR & KPR) — [{filteredSales.length}]
        </button>
        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`pb-3 border-b-2 transition-all ${
            activeReportTab === 'inventory'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Laporan Stok Kavling & Progress — [{filteredUnits.length}]
        </button>
        <button
          onClick={() => setActiveReportTab('finance')}
          className={`pb-3 border-b-2 transition-all ${
            activeReportTab === 'finance'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Laporan Arus Kas Jurnal Keuangan — [{filteredFinances.length}]
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        {activeReportTab === 'sales' && (
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <th className="p-3">No. SPR</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Proyek & Unit</th>
                <th className="p-3">Nama Pembeli</th>
                <th className="p-3">Skema Bayar</th>
                <th className="p-3 text-right">Harga Kesepakatan</th>
                <th className="p-3">Bank & Status KPR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada data penjualan SPR pada periode & proyek yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 font-mono">{s.sprNumber}</td>
                    <td className="p-3 text-slate-500">{s.transactionDate}</td>
                    <td className="p-3 font-bold text-amber-700">{s.projectName} (Blok {s.unitCode})</td>
                    <td className="p-3 font-semibold text-slate-900">{s.buyer.name}</td>
                    <td className="p-3 font-bold uppercase">{s.paymentType}</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatRupiah(s.agreedPrice)}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800">{s.kprBank || '-'}</span>
                      <span className="text-[10px] text-slate-500 block">({s.kprStatus || 'Lunas'})</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeReportTab === 'inventory' && (
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <th className="p-3">Proyek</th>
                <th className="p-3">Unit Code</th>
                <th className="p-3">Tipe</th>
                <th className="p-3">LT / LB</th>
                <th className="p-3">Harga Cash</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progres Fisik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada data unit kavling.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold">{u.projectName}</td>
                    <td className="p-3 font-black text-amber-700">{u.unitCode}</td>
                    <td className="p-3">{u.type}</td>
                    <td className="p-3">{u.landArea}m² / {u.buildingArea}m²</td>
                    <td className="p-3 font-bold text-slate-900">{formatRupiah(u.priceCash)}</td>
                    <td className="p-3 font-bold uppercase">{u.status}</td>
                    <td className="p-3 font-bold text-amber-700">{u.progressPercent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeReportTab === 'finance' && (
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <th className="p-3">Tanggal / No Ref</th>
                <th className="p-3">Uraian Transaksi</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Penyetor / Penerima</th>
                <th className="p-3">Metode</th>
                <th className="p-3 text-right">Cash In / Out (Rp)</th>
                <th className="p-3 text-right bg-slate-800 text-amber-400">Saldo Akumulasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1: Saldo Bulan Sebelumnya */}
              <tr className="bg-amber-50/80 border-b-2 border-amber-200 font-bold">
                <td className="p-3 text-amber-900 font-mono">{startDate}</td>
                <td className="p-3 text-amber-950 font-black" colSpan={4}>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded text-[10px] font-black">
                      SALDO AWAL
                    </span>
                    <span>SALDO AWAL PERIODE / BULAN SEBELUMNYA</span>
                  </div>
                </td>
                <td className="p-3 text-right text-slate-400 italic font-normal">-</td>
                <td className="p-3 text-right font-black text-amber-950 text-sm bg-amber-100/50">
                  {formatRupiah(saldoAwalPeriode)}
                </td>
              </tr>

              {financesWithRunningBalance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada data transaksi kas pada periode ini.
                  </td>
                </tr>
              ) : (
                financesWithRunningBalance.map(({ record: f, runningBalance }) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{formatDate(f.date)}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{f.refNumber}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{f.title}</div>
                      <div className="text-[10px] text-amber-600 font-normal">{f.projectName}</div>
                    </td>
                    <td className="p-3 font-bold uppercase text-[10px] text-slate-600">{f.category}</td>
                    <td className="p-3 text-slate-700">{f.payerName || '-'}</td>
                    <td className="p-3">{f.paymentMethod}</td>
                    <td className={`p-3 text-right font-black ${f.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {f.type === 'income' ? '+' : '-'}{formatRupiah(f.amount)}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 bg-slate-50/50">
                      {formatRupiah(runningBalance)}
                    </td>
                  </tr>
                ))
              )}

              {/* Final Row: Saldo Akhir Periode */}
              <tr className="bg-slate-900 text-white font-extrabold border-t-2 border-slate-700">
                <td className="p-3 text-amber-400 font-mono">{endDate}</td>
                <td className="p-3" colSpan={4}>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded text-[10px] font-black">
                      SALDO AKHIR
                    </span>
                    <span className="text-slate-200">
                      SALDO AKHIR PERIODE (OTOMATIS MENJADI SALDO AWAL BERIKUTNYA)
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right text-xs">
                  <span className="text-emerald-400">+{formatRupiah(totalIncomePeriod)}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-rose-400">-{formatRupiah(totalExpensePeriod)}</span>
                </td>
                <td className="p-3 text-right font-black text-amber-400 text-sm bg-slate-800">
                  {formatRupiah(saldoAkhirPeriode)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
