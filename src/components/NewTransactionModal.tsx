import React, { useState } from 'react';
import { Unit, SalesTransaction, PaymentType, KprStatus, CustomerProfile, AppUser } from '../types';
import { formatRupiah } from '../utils/formatters';
import { X, FileCheck2, User, Building, CreditCard, CheckCircle2, UserCheck, Clock } from 'lucide-react';

interface NewTransactionModalProps {
  units: Unit[];
  customers?: CustomerProfile[];
  currentUser?: AppUser | null;
  preselectedUnit?: Unit | null;
  onClose: () => void;
  onSubmit: (transaction: SalesTransaction) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  units,
  customers = [],
  currentUser,
  preselectedUnit,
  onClose,
  onSubmit,
}) => {
  const availableUnits = units.filter((u) => u.status === 'available' || u.id === preselectedUnit?.id);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    preselectedUnit ? preselectedUnit.id : availableUnits[0]?.id || ''
  );

  const currentUnit = units.find((u) => u.id === selectedUnitId) || availableUnits[0];

  // Selected Existing Customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Form Fields
  const [buyerName, setBuyerName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [job, setJob] = useState('');
  const [income, setIncome] = useState(15000000);

  const [paymentType, setPaymentType] = useState<PaymentType>('kpr');
  const [agreedPrice, setAgreedPrice] = useState<number>(currentUnit?.priceKpr || 400000000);
  const [bookingFeePaid, setBookingFeePaid] = useState<number>(currentUnit?.bookingFee || 3000000);
  const [dpAmount, setDpAmount] = useState<number>(currentUnit?.minDp || 15000000);
  const [dpPaid, setDpPaid] = useState<number>(currentUnit?.minDp || 15000000);
  const [kprBank, setKprBank] = useState<string>('Bank BTN Syariah');
  const [marketingAgent, setMarketingAgent] = useState(currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Rian Prasetya (Inhouse Yusuf Property)');
  const [notes, setNotes] = useState('Berkas persyaratan KPR telah diverifikasi & dicetak SPR oleh Sales');

  // Backdate Option States
  const [isBackdate, setIsBackdate] = useState<boolean>(false);
  const [backdateDate, setBackdateDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [backdateNotes, setBackdateNotes] = useState<string>('');

  // Handle unit change
  const handleUnitChange = (id: string) => {
    setSelectedUnitId(id);
    const u = units.find((x) => x.id === id);
    if (u) {
      setAgreedPrice(paymentType === 'cash_keras' ? u.priceCash : u.priceKpr);
      setBookingFeePaid(u.bookingFee);
      setDpAmount(u.minDp);
      setDpPaid(u.minDp);
    }
  };

  // Handle Selecting Existing Customer from Master Data User
  const handleSelectExistingCustomer = (id: string) => {
    setSelectedCustomerId(id);
    if (!id) return;

    const cust = customers.find((c) => c.id === id);
    if (cust) {
      setBuyerName(cust.name);
      setNik(cust.nik);
      setPhone(cust.phone);
      setEmail(cust.email || '');
      setAddress(cust.address);
      setJob(cust.jobTitle || 'Karyawan');
      setIncome(cust.monthlyIncome || 15000000);
      if (cust.marketingAgent) setMarketingAgent(cust.marketingAgent);
      if (cust.kprBankTarget) setKprBank(cust.kprBankTarget);

      // Auto pick unit if unitCode matches
      if (cust.unitCode) {
        const matched = availableUnits.find(
          (u) => u.unitCode.toLowerCase() === cust.unitCode.toLowerCase()
        );
        if (matched) {
          handleUnitChange(matched.id);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !nik || !currentUnit) return;

    const nowStr = `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`;
    const userAuditInfo = currentUser
      ? `${currentUser.name} (${currentUser.role})`
      : 'User Login System';
    const txDate = isBackdate ? backdateDate : new Date().toISOString().split('T')[0];

    const newSales: SalesTransaction = {
      id: `sale-${Date.now()}`,
      sprNumber: `SPR/YP/2026/${Math.floor(100 + Math.random() * 900)}`,
      unitId: currentUnit.id,
      unitCode: currentUnit.unitCode,
      projectName: currentUnit.projectName,
      buyer: {
        id: selectedCustomerId || `b-${Date.now()}`,
        name: buyerName,
        nik,
        phone,
        email,
        address,
        job,
        monthlyIncome: income,
      },
      marketingAgent,
      transactionDate: txDate,
      paymentType,
      agreedPrice,
      bookingFeePaid,
      dpAmount,
      dpPaid,
      kprBank: paymentType === 'kpr' ? kprBank : undefined,
      kprAmount: paymentType === 'kpr' ? agreedPrice - dpAmount : undefined,
      kprStatus: paymentType === 'kpr' ? 'pemberkasan' : undefined,
      notes: isBackdate ? `${notes} (Backdate: ${backdateNotes})` : notes,
      isBackdate,
      backdateDate: isBackdate ? txDate : undefined,
      backdateNotes: isBackdate ? backdateNotes.trim() : undefined,
      createdBy: userAuditInfo,
      createdAt: nowStr,
      updatedBy: userAuditInfo,
      updatedAt: nowStr,
      statusLogs: [
        {
          timestamp: nowStr,
          user: userAuditInfo,
          oldStatus: 'Draft Baru',
          newStatus: paymentType === 'kpr' ? 'pemberkasan' : 'Cash Deal',
          notes: `Cetak SPR Pertama${isBackdate ? ` [BACKDATE: ${txDate} - Ket: ${backdateNotes}]` : ''} oleh ${userAuditInfo}`,
        },
      ],
    };

    onSubmit(newSales);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-400 text-slate-950 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Form Pemesanan Rumah / SPR Baru</h3>
              <p className="text-[11px] text-amber-300">Yusuf Property ERP System — Terkoneksi ke Data User</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Login Banner */}
        <div className="bg-slate-800 text-slate-200 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Petugas Input: <strong className="text-white">{currentUser?.name || 'Inhouse Agent'}</strong> ({currentUser?.role || 'User'})</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 text-xs text-slate-800 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Unit Selection */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-900 block flex items-center justify-between">
              <span>1. Pilih Unit Kavling / Proyek</span>
              <span className="text-[10px] text-amber-600 font-extrabold">{availableUnits.length} Unit Tersedia</span>
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  Blok {u.unitCode} - {u.projectName} ({u.type}) - Cash: {formatRupiah(u.priceCash)} | KPR: {formatRupiah(u.priceKpr)}
                </option>
              ))}
            </select>
          </div>

          {/* Buyer Data */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h4 className="font-bold text-slate-900">2. Data Pemesan / Konsumen</h4>
              <span className="text-[10px] text-indigo-600 font-bold">Terhubung ke Data User & Berkas</span>
            </div>

            {/* Quick Select Existing Customer Profile */}
            {customers.length > 0 && (
              <div className="p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-1">
                <label className="font-extrabold text-indigo-950 block text-[11px] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Pilih dari Database User Terecord (Otomatis Isikan Data):
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                  className="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Nama User Konsumen dari Master Data User --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (NIK: {c.nik}) - Blok: {c.unitCode || '-'} - Status: {c.statusPemberkasan}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block text-slate-600 mb-1">Nama Lengkap (KTP)</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Subagja"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block text-slate-600 mb-1">NIK KTP</label>
                <input
                  type="text"
                  placeholder="32730..."
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block text-slate-600 mb-1">No. HP / WhatsApp</label>
                <input
                  type="text"
                  placeholder="0812..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block text-slate-600 mb-1">Pekerjaan / Instansi</label>
                <input
                  type="text"
                  placeholder="Karyawan BUMN / PNS"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block text-slate-600 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                placeholder="Jl. Kopo Indah..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Payment Scheme */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">3. Skema Pembayaran & KPR</h4>
            
            <div className="grid grid-cols-3 gap-2">
              {(['kpr', 'cash_keras', 'cash_bertahap'] as PaymentType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => {
                    setPaymentType(type);
                    if (currentUnit) {
                      setAgreedPrice(type === 'cash_keras' ? currentUnit.priceCash : currentUnit.priceKpr);
                    }
                  }}
                  className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                    paymentType === type
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type === 'kpr' ? 'KPR Bank' : type === 'cash_keras' ? 'Cash Keras' : 'Cash Bertahap'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block text-slate-600 mb-1">Harga Kesepakatan (Rp)</label>
                <input
                  type="number"
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold block text-slate-600 mb-1">Booking Fee (Rp)</label>
                <input
                  type="number"
                  value={bookingFeePaid}
                  onChange={(e) => setBookingFeePaid(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-700"
                />
              </div>
            </div>

            {paymentType === 'kpr' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Bank Mitra KPR</label>
                  <select
                    value={kprBank}
                    onChange={(e) => setKprBank(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-slate-900"
                  >
                    <option value="Bank BTN Syariah">Bank BTN Syariah</option>
                    <option value="Bank BSI (Bank Syariah Indonesia)">Bank BSI</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank BCA">Bank BCA</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Marketing Agent / Sales</label>
                  <input
                    type="text"
                    value={marketingAgent}
                    onChange={(e) => setMarketingAgent(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Opsi Backdate Tanggal Mundur */}
            <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/80 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-950">
                <input
                  type="checkbox"
                  checked={isBackdate}
                  onChange={(e) => setIsBackdate(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Atur Transaksi SPR sebagai Backdate (Tanggal Mundur)
                </span>
              </label>
              {isBackdate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-150">
                  <div>
                    <label className="font-bold text-purple-900 block mb-1 text-[11px]">Tanggal Mundur *</label>
                    <input
                      type="date"
                      required={isBackdate}
                      value={backdateDate}
                      onChange={(e) => setBackdateDate(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-300 rounded-lg font-bold text-purple-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-purple-900 block mb-1 text-[11px]">Keterangan & Alasan Backdate *</label>
                    <input
                      type="text"
                      required={isBackdate}
                      placeholder="Contoh: Penginputan kuitansi susulan akad KPR bulan lalu"
                      value={backdateNotes}
                      onChange={(e) => setBackdateNotes(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-300 rounded-lg font-medium text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          </div>

          {/* Sticky Footer */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <div className="text-[11px] text-amber-400 font-bold hidden sm:block">
              ✨ Auto Sync: SPR dicetak & status Data User terupdate otomatis
            </div>
            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Cetak & Simpan SPR Baru</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

