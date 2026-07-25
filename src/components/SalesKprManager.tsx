import React, { useState } from 'react';
import { SalesTransaction, KprStatus, AppUser } from '../types';
import { formatRupiah, getKprStatusLabel } from '../utils/formatters';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Building2,
  User,
  Phone,
  FileText,
  CreditCard,
  X,
  AlertCircle,
  Plus,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface SalesKprManagerProps {
  sales: SalesTransaction[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenNewTransaction: () => void;
  onUpdateKprStatus: (saleId: string, nextStatus: KprStatus) => void;
  currentUser?: AppUser | null;
}

export const SalesKprManager: React.FC<SalesKprManagerProps> = ({
  sales,
  searchTerm,
  setSearchTerm,
  onOpenNewTransaction,
  onUpdateKprStatus,
  currentUser,
}) => {
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<SalesTransaction | null>(null);

  const isSalesMarketing = currentUser?.role === 'Sales Marketing';

  const filteredSales = sales.filter((s) => {
    // If user is Sales Marketing, only show transactions belonging to them
    if (isSalesMarketing && currentUser?.name) {
      const agentMatch = s.marketingAgent.toLowerCase().includes(currentUser.name.toLowerCase());
      if (!agentMatch) return false;
    }

    const term = searchTerm.toLowerCase();
    return (
      s.sprNumber.toLowerCase().includes(term) ||
      s.unitCode.toLowerCase().includes(term) ||
      s.buyer.name.toLowerCase().includes(term) ||
      s.buyer.phone.toLowerCase().includes(term) ||
      s.projectName.toLowerCase().includes(term) ||
      s.marketingAgent.toLowerCase().includes(term)
    );
  });

  const kprStages: KprStatus[] = [
    'pemberkasan',
    'wawancara',
    'analisis_bank',
    'sp3k_disetujui',
    'akad_kredit',
    'cair_stage_1',
    'cair_100',
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      {isSalesMarketing && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center gap-2.5 font-bold shadow-sm">
          <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Mode Akses Marketing: Menampilkan khusus data konsumen & transaksi SPR KPR milik Anda (<strong>{currentUser?.name}</strong>)
          </span>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Penjualan (SPR) & Process KPR Bank</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen Surat Pesanan Rumah (SPR) dan tahapan pemrosesan KPR konsumen di Bank Kerjasama Yusuf Property.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari SPR, Nama Konsumen, Unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 w-64"
            />
          </div>

          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Input SPR Baru</span>
          </button>
        </div>
      </div>

      {/* KPR Step Pipeline Visual Banner */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-white space-y-3 shadow-lg">
        <h3 className="font-bold text-xs uppercase text-amber-400 tracking-wider">
          7 Tahapan Alur Pemrosesan KPR Konsumen Yusuf Property
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px]">
          {kprStages.map((stg, idx) => {
            const labelInfo = getKprStatusLabel(stg);
            return (
              <div key={stg} className="p-2 bg-slate-800 rounded-lg border border-slate-700/80">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black mx-auto flex items-center justify-center text-[10px] mb-1">
                  {idx + 1}
                </div>
                <div className="font-bold text-slate-200">{labelInfo.label.split('.')[1]?.trim()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPR Transactions List */}
      <div className="space-y-4">
        {filteredSales.map((sale) => {
          const kprInfo = getKprStatusLabel(sale.kprStatus);

          return (
            <div
              key={sale.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 transition-all space-y-4"
            >
              {/* Top Row: SPR Info & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-900 text-amber-400 font-extrabold text-xs rounded-lg">
                    {sale.sprNumber}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    Unit <span className="text-amber-600">{sale.unitCode}</span> ({sale.projectName})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Tgl: {sale.transactionDate}</span>
                  <button
                    onClick={() => setSelectedSaleForPrint(sale)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Cetak SPR"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak SPR</span>
                  </button>
                </div>
              </div>

              {/* Middle Row: Buyer & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Buyer Card */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>{sale.buyer.name}</span>
                  </div>
                  <p className="text-slate-500">NIK: {sale.buyer.nik}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {sale.buyer.phone}
                  </p>
                  <p className="text-slate-500 truncate">Pekerjaan: {sale.buyer.job}</p>
                </div>

                {/* Price & Payment Type */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-slate-500 font-medium">Skema Pembayaran</div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {formatRupiah(sale.agreedPrice)}
                  </div>
                  <p className="text-slate-600 font-semibold uppercase">
                    {sale.paymentType === 'kpr' ? `KPR (${sale.kprBank})` : sale.paymentType === 'cash_keras' ? 'Cash Keras' : 'Cash Bertahap'}
                  </p>
                  <p className="text-emerald-700 font-semibold">
                    DP Terbayar: {formatRupiah(sale.dpPaid)} / {formatRupiah(sale.dpAmount)}
                  </p>
                </div>

                {/* Agent & SP3K Info */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-slate-500 font-medium">Marketing Agent</div>
                  <div className="font-bold text-slate-800">{sale.marketingAgent}</div>
                  {sale.sp3kNumber && (
                    <p className="text-amber-700 font-semibold">
                      SP3K: {sale.sp3kNumber} ({sale.sp3kDate})
                    </p>
                  )}
                  {sale.notes && (
                    <p className="text-slate-500 italic text-[11px] truncate">"{sale.notes}"</p>
                  )}
                </div>

              </div>

              {/* Bottom Row: Interactive KPR Workflow Progress */}
              {sale.paymentType === 'kpr' && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Status Tahapan KPR Bank ({sale.kprBank}):
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${kprInfo.color}`}>
                      {kprInfo.label}
                    </span>
                  </div>

                  {/* KPR Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {kprStages.map((stg, i) => {
                      const stgInfo = getKprStatusLabel(stg);
                      const currentStep = getKprStatusLabel(sale.kprStatus).step;
                      const isCompleted = stgInfo.step <= currentStep;
                      const isCurrent = stgInfo.step === currentStep;

                      return (
                        <button
                          key={stg}
                          onClick={() => onUpdateKprStatus(sale.id, stg)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{stgInfo.label.split('.')[1]?.trim()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Printable SPR Modal */}
      {selectedSaleForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <span className="font-bold text-sm">SURAT PESANAN RUMAH (SPR) - YUSUF PROPERTY</span>
              <button
                onClick={() => setSelectedSaleForPrint(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-800 font-sans print:p-0">
              
              {/* Header Letterhead */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <h1 className="text-xl font-black text-slate-900 tracking-wider">PT YUSUF PROPERTY INDONESIA</h1>
                <p className="text-[11px] text-slate-600">
                  Developer & Real Estate Perumahan Modern | Office: Subang & Bandung
                </p>
                <div className="inline-block px-3 py-1 bg-amber-400 text-slate-950 font-extrabold rounded-md text-xs mt-2">
                  SURAT PESANAN RUMAH (SPR)
                </div>
              </div>

              {/* SPR Content */}
              <div className="space-y-4">
                <div className="flex justify-between font-bold border-b border-slate-200 pb-2">
                  <span>No. SPR: {selectedSaleForPrint.sprNumber}</span>
                  <span>Tanggal: {selectedSaleForPrint.transactionDate}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase">I. DATA KONSUMEN / PEMESAN</h4>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg">
                    <div>Nama Lengkap: <span className="font-bold">{selectedSaleForPrint.buyer.name}</span></div>
                    <div>NIK KTP: <span className="font-bold">{selectedSaleForPrint.buyer.nik}</span></div>
                    <div>No. WhatsApp/HP: <span className="font-bold">{selectedSaleForPrint.buyer.phone}</span></div>
                    <div>Pekerjaan: <span className="font-bold">{selectedSaleForPrint.buyer.job}</span></div>
                    <div className="col-span-2">Alamat: <span className="font-bold">{selectedSaleForPrint.buyer.address}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase">II. DETAIL UNIT RUMAH & SKEMA PEMBAYARAN</h4>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg">
                    <div>Proyek: <span className="font-bold">{selectedSaleForPrint.projectName}</span></div>
                    <div>Blok Unit: <span className="font-bold text-amber-600">{selectedSaleForPrint.unitCode}</span></div>
                    <div>Harga Kesepakatan: <span className="font-bold text-slate-900">{formatRupiah(selectedSaleForPrint.agreedPrice)}</span></div>
                    <div>Skema Bayar: <span className="font-bold uppercase">{selectedSaleForPrint.paymentType}</span></div>
                    <div>Booking Fee: <span className="font-bold text-emerald-700">{formatRupiah(selectedSaleForPrint.bookingFeePaid)} (Lunas)</span></div>
                    <div>Uang Muka (DP): <span className="font-bold text-emerald-700">{formatRupiah(selectedSaleForPrint.dpPaid)} / {formatRupiah(selectedSaleForPrint.dpAmount)}</span></div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center pt-8">
                  <div>
                    <p className="font-semibold text-slate-600">Pemesan / Konsumen</p>
                    <div className="h-16"></div>
                    <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                      ({selectedSaleForPrint.buyer.name})
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Developer PT Yusuf Property</p>
                    <div className="h-16"></div>
                    <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                      ( Direktur / Marketing Manager )
                    </p>
                  </div>
                </div>

              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedSaleForPrint(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak SPR / Simpan PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
