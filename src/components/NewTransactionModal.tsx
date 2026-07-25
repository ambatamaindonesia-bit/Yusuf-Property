import React, { useState } from 'react';
import { Unit, SalesTransaction, PaymentType, KprStatus } from '../types';
import { formatRupiah } from '../utils/formatters';
import { X, FileCheck2, User, Building, CreditCard, CheckCircle2 } from 'lucide-react';

interface NewTransactionModalProps {
  units: Unit[];
  preselectedUnit?: Unit | null;
  onClose: () => void;
  onSubmit: (transaction: SalesTransaction) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  units,
  preselectedUnit,
  onClose,
  onSubmit,
}) => {
  const availableUnits = units.filter((u) => u.status === 'available' || u.id === preselectedUnit?.id);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    preselectedUnit ? preselectedUnit.id : availableUnits[0]?.id || ''
  );

  const currentUnit = units.find((u) => u.id === selectedUnitId) || availableUnits[0];

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
  const [marketingAgent, setMarketingAgent] = useState('Rian Prasetya (Inhouse Yusuf Property)');
  const [notes, setNotes] = useState('Berkas persyaratan KPR sudah diserahkan ke tim Legal');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !nik || !currentUnit) return;

    const newSales: SalesTransaction = {
      id: `sale-${Date.now()}`,
      sprNumber: `SPR/YP/2026/${Math.floor(100 + Math.random() * 900)}`,
      unitId: currentUnit.id,
      unitCode: currentUnit.unitCode,
      projectName: currentUnit.projectName,
      buyer: {
        id: `b-${Date.now()}`,
        name: buyerName,
        nik,
        phone,
        email,
        address,
        job,
        monthlyIncome: income,
      },
      marketingAgent,
      transactionDate: new Date().toISOString().split('T')[0],
      paymentType,
      agreedPrice,
      bookingFeePaid,
      dpAmount,
      dpPaid,
      kprBank: paymentType === 'kpr' ? kprBank : undefined,
      kprAmount: paymentType === 'kpr' ? agreedPrice - dpAmount : undefined,
      kprStatus: paymentType === 'kpr' ? 'pemberkasan' : undefined,
      notes,
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
              <p className="text-[11px] text-amber-300">Yusuf Property ERP System</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 text-xs text-slate-800 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Unit Selection */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-900 block">1. Pilih Unit Kavling / Proyek</label>
            <select
              value={selectedUnitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-amber-600"
            >
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  Blok {u.unitCode} - {u.projectName} ({u.type}) - {formatRupiah(u.priceCash)}
                </option>
              ))}
            </select>
          </div>

          {/* Buyer Data */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">2. Data Pemesan / Konsumen</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block text-slate-600 mb-1">Nama Lengkap (KTP)</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Subagja"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
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
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
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
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
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
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
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
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold"
                  >
                    <option value="Bank BTN Syariah">Bank BTN Syariah</option>
                    <option value="Bank BSI (Bank Syariah Indonesia)">Bank BSI</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank BCA">Bank BCA</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Marketing Agent</label>
                  <input
                    type="text"
                    value={marketingAgent}
                    onChange={(e) => setMarketingAgent(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          </div>

          {/* Sticky Footer */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <div className="text-[11px] text-amber-400 font-bold hidden sm:block">
              ✨ Transaksi SPR baru akan dicetak & tercatat otomatis
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
