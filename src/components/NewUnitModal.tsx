import React, { useState } from 'react';
import { HousingProject, Unit, AppUser } from '../types';
import { X, Plus, Building2, ShieldAlert } from 'lucide-react';

interface NewUnitModalProps {
  projects: HousingProject[];
  onClose: () => void;
  onSubmit: (unit: Unit) => void;
  currentUser?: AppUser | null;
}

export const NewUnitModal: React.FC<NewUnitModalProps> = ({
  projects,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const isSuperAdmin = !currentUser || currentUser.role === 'Super Admin';
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const [block, setBlock] = useState('A');
  const [number, setNumber] = useState('06');
  const [type, setType] = useState('Tipe 36/72');
  const [landArea, setLandArea] = useState(72);
  const [buildingArea, setBuildingArea] = useState(36);
  const [priceCash, setPriceCash] = useState(385000000);
  const [priceKpr, setPriceKpr] = useState(398000000);
  const [bookingFee, setBookingFee] = useState(3000000);
  const [minDp, setMinDp] = useState(10000000);
  const [facing, setFacing] = useState<'Utara' | 'Selatan' | 'Timur' | 'Barat'>('Utara');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);

  // Specifications
  const [pondasi, setPondasi] = useState('Batu Kali & Cakar Ayam');
  const [dinding, setDinding] = useState('Bata Ringan Hebel Diplester & Aci');
  const [atap, setAtap] = useState('Baja Ringan & Genteng Metal');
  const [lantai, setLantai] = useState('Granit Tile 60x60');
  const [listrik, setListrik] = useState('PLN 1300 VA');
  const [air, setAir] = useState('PDAM / Sumur Bor Jetpump');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentProj = projects.find((p) => p.id === projectId);
    if (!currentProj) return;

    const unitCode = `${block}-${number.padStart(2, '0')}`;

    const newUnit: Unit = {
      id: `u-${Date.now()}`,
      projectId,
      projectName: currentProj.name,
      block,
      number,
      unitCode,
      type,
      landArea,
      buildingArea,
      priceCash,
      priceKpr,
      bookingFee,
      minDp,
      status: 'available',
      progressPercent: 0,
      facing,
      bedrooms,
      bathrooms,
      specifications: {
        pondasi,
        dinding,
        atap,
        lantai,
        listrik,
        air,
      },
    };

    onSubmit(newUnit);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        
        {/* Sticky Header */}
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl shadow-sm">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Tambah Kavling Unit Baru</h3>
              <p className="text-[11px] text-amber-300/90 font-medium">Isi data spesifikasi & harga stok unit perumahan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 text-xs text-slate-800 overflow-y-auto flex-1 custom-scrollbar">
            
            {!isSuperAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold block">Akses Khusus Admin Utama (Super Admin)</span>
                  <span className="text-[11px] text-amber-800">
                    Penambahan kavling / unit baru hanya dapat disimpan oleh Super Admin. Anda sedang login sebagai {currentUser?.role}.
                  </span>
                </div>
              </div>
            )}
            
            {/* Proyek Selector */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="font-bold block mb-1 text-slate-900">Proyek Perumahan *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ({p.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Identitas Unit */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Blok (A, B...)</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black uppercase text-amber-700"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Nomor Kavling</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Tipe Rumah</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Hadap Arah</label>
                <select
                  value={facing}
                  onChange={(e) => setFacing(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="Utara">Utara</option>
                  <option value="Selatan">Selatan</option>
                  <option value="Timur">Timur</option>
                  <option value="Barat">Barat</option>
                </select>
              </div>
            </div>

            {/* Ukuran & Ruangan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Luas Tanah (m²)</label>
                <input
                  type="number"
                  value={landArea}
                  onChange={(e) => setLandArea(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Luas Bangunan (m²)</label>
                <input
                  type="number"
                  value={buildingArea}
                  onChange={(e) => setBuildingArea(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Kamar Tidur</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Kamar Mandi</label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            {/* Harga & DP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200/80">
              <div>
                <label className="font-bold block mb-1 text-amber-900">Harga Cash (Rp)</label>
                <input
                  type="number"
                  value={priceCash}
                  onChange={(e) => setPriceCash(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg font-extrabold text-amber-700"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-900">Plafon KPR (Rp)</label>
                <input
                  type="number"
                  value={priceKpr}
                  onChange={(e) => setPriceKpr(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-extrabold text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Booking Fee (Rp)</label>
                <input
                  type="number"
                  value={bookingFee}
                  onChange={(e) => setBookingFee(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Min. DP (Rp)</label>
                <input
                  type="number"
                  value={minDp}
                  onChange={(e) => setMinDp(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>
            </div>

            {/* Specifications */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs">Spesifikasi Teknis Bangunan</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <label className="font-semibold text-slate-600 block mb-0.5">Pondasi</label>
                  <input
                    type="text"
                    value={pondasi}
                    onChange={(e) => setPondasi(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-0.5">Dinding</label>
                  <input
                    type="text"
                    value={dinding}
                    onChange={(e) => setDinding(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-0.5">Atap & Plafon</label>
                  <input
                    type="text"
                    value={atap}
                    onChange={(e) => setAtap(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-0.5">Lantai</label>
                  <input
                    type="text"
                    value={lantai}
                    onChange={(e) => setLantai(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-0.5">Listrik</label>
                  <input
                    type="text"
                    value={listrik}
                    onChange={(e) => setListrik(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-0.5">Sumber Air</label>
                  <input
                    type="text"
                    value={air}
                    onChange={(e) => setAir(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Bottom Footer - Always Visible Save Button */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <div className="text-[11px] text-amber-400 font-bold hidden sm:block">
              ✨ Unit akan langsung tersimpan di sistem ERP & status 'Tersedia'
            </div>
            <div className="flex items-center gap-3 ml-auto w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!isSuperAdmin}
                className={`px-6 py-2.5 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isSuperAdmin
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 cursor-pointer'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>SIMPAN STOK KAVLING</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
