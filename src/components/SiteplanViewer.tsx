import React, { useState } from 'react';
import { HousingProject, Unit, UnitStatus } from '../types';
import { formatRupiah, getUnitStatusBadge } from '../utils/formatters';
import {
  Grid3X3,
  Filter,
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Compass,
  Bed,
  Bath,
  Maximize2,
  X,
  FileCheck2,
  Edit,
  Info,
} from 'lucide-react';

interface SiteplanViewerProps {
  projects: HousingProject[];
  units: Unit[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  onSelectUnitForSpr: (unit: Unit) => void;
  onOpenNewUnitModal: () => void;
  onUpdateUnitStatus: (unitId: string, newStatus: UnitStatus) => void;
  onUpdateUnit?: (updatedUnit: Unit) => void;
}

export const SiteplanViewer: React.FC<SiteplanViewerProps> = ({
  projects,
  units,
  selectedProjectId,
  setSelectedProjectId,
  onSelectUnitForSpr,
  onOpenNewUnitModal,
  onUpdateUnitStatus,
  onUpdateUnit,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [detailModalUnit, setDetailModalUnit] = useState<Unit | null>(null);

  // Unit Specification Editing State
  const [isEditingSpecs, setIsEditingSpecs] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Unit | null>(null);

  // When clicking a unit, initialize edit form state
  const handleOpenDetailModal = (unit: Unit) => {
    setDetailModalUnit(unit);
    setEditForm(unit);
    setIsEditingSpecs(false);
  };

  const handleSaveUnitSpecs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (onUpdateUnit) {
      onUpdateUnit(editForm);
    }
    setDetailModalUnit(editForm);
    setIsEditingSpecs(false);
  };

  // Filtered units
  const filteredUnits = units.filter((u) => {
    const matchProj = selectedProjectId === 'all' || u.projectId === selectedProjectId;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchBlock = selectedBlock === 'all' || u.block === selectedBlock;
    return matchProj && matchStatus && matchBlock;
  });

  // Extract unique blocks
  const blocks = Array.from(new Set(units.map((u) => u.block))).sort();

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Grid3X3 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Site Plan Digital & Bloking Plan Stok</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Peta interaktif stok kavling perumahan Yusuf Property. Pilih unit untuk melihat spesifikasi atau memproses SPR/Booking.
            </p>
          </div>

          <button
            onClick={onOpenNewUnitModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 self-start md:self-auto transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Tambah Kavling Baru</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Proyek:
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">Semua Proyek Perumahan</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <span className="font-semibold text-slate-600 ml-2">Blok:</span>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">Semua Blok (A, B, C...)</option>
              {blocks.map((b) => (
                <option key={b} value={b}>
                  Blok {b}
                </option>
              ))}
            </select>
          </div>

          {/* Legend Badges */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({units.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                statusFilter === 'available'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Tersedia ({units.filter((u) => u.status === 'available').length})
            </button>
            <button
              onClick={() => setStatusFilter('booking')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                statusFilter === 'booking'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Booking ({units.filter((u) => u.status === 'booking').length})
            </button>
            <button
              onClick={() => setStatusFilter('sold')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                statusFilter === 'sold'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Terjual ({units.filter((u) => u.status === 'sold').length})
            </button>
          </div>
        </div>
      </div>

      {/* Site Plan Interactive Blocking Grid */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">PETA LOKASI SITE PLAN - BLOKING PLAN KAVLING</span>
          </div>
          <span>Menampilkan {filteredUnits.length} Kavling</span>
        </div>

        {/* Grid Container */}
        {filteredUnits.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">Tidak ada unit kavling sesuai filter ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredUnits.map((unit) => {
              const statusBadge = getUnitStatusBadge(unit.status);
              
              // Custom tile styles depending on status
              let tileStyle = 'bg-slate-800 border-slate-700 hover:border-amber-400';
              let badgeColor = 'bg-slate-700 text-slate-300';

              if (unit.status === 'available') {
                tileStyle = 'bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400 shadow-emerald-950/20';
                badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              } else if (unit.status === 'booking') {
                tileStyle = 'bg-amber-950/40 border-amber-500/50 hover:border-amber-400 shadow-amber-950/20';
                badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              } else if (unit.status === 'sold') {
                tileStyle = 'bg-rose-950/30 border-rose-500/40 opacity-90';
                badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
              } else if (unit.status === 'construction') {
                tileStyle = 'bg-blue-950/40 border-blue-500/50 hover:border-blue-400';
                badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
              }

              return (
                <div
                  key={unit.id}
                  onClick={() => handleOpenDetailModal(unit)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between h-36 ${tileStyle}`}
                >
                  {/* Top Bar inside Tile */}
                  <div className="flex items-center justify-between">
                    <span className="font-black text-lg text-white group-hover:text-amber-300 transition-colors">
                      {unit.unitCode}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${badgeColor}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Middle Info */}
                  <div className="space-y-1 my-1">
                    <p className="text-[11px] font-medium text-slate-300 truncate">
                      {unit.type}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      LT: {unit.landArea}m² | LB: {unit.buildingArea}m²
                    </p>
                    <p className="text-[11px] font-bold text-amber-400">
                      {formatRupiah(unit.priceCash)}
                    </p>
                  </div>

                  {/* Progress Bar at bottom */}
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                      <span>Progres</span>
                      <span>{unit.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${unit.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unit Detail Modal */}
      {detailModalUnit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-black rounded bg-amber-400 text-slate-950">
                    BLOK {detailModalUnit.unitCode}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {detailModalUnit.projectName}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-1 text-white">
                  Spesifikasi & Detail Kavling Unit {detailModalUnit.unitCode}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalUnit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
              
              {/* Header Action Bar inside Modal */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">
                  {isEditingSpecs ? 'Edit Spesifikasi & Unit Kavling' : 'Informasi Spesifikasi Unit'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingSpecs) setEditForm(detailModalUnit);
                    setIsEditingSpecs(!isEditingSpecs);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isEditingSpecs
                      ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isEditingSpecs ? 'Batal Edit' : 'Edit Spesifikasi Unit'}</span>
                </button>
              </div>

              {isEditingSpecs && editForm ? (
                /* EDIT FORM MODE */
                <form onSubmit={handleSaveUnitSpecs} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tipe Rumah</label>
                      <input
                        type="text"
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Hadap Rumah</label>
                      <select
                        value={editForm.facing}
                        onChange={(e) => setEditForm({ ...editForm, facing: e.target.value as any })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      >
                        <option value="Utara">Utara</option>
                        <option value="Selatan">Selatan</option>
                        <option value="Timur">Timur</option>
                        <option value="Barat">Barat</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Luas Tanah (m²)</label>
                      <input
                        type="number"
                        value={editForm.landArea}
                        onChange={(e) => setEditForm({ ...editForm, landArea: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Luas Bangunan (m²)</label>
                      <input
                        type="number"
                        value={editForm.buildingArea}
                        onChange={(e) => setEditForm({ ...editForm, buildingArea: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Harga Cash Keras (Rp)</label>
                      <input
                        type="number"
                        value={editForm.priceCash}
                        onChange={(e) => setEditForm({ ...editForm, priceCash: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Harga Plafon KPR (Rp)</label>
                      <input
                        type="number"
                        value={editForm.priceKpr}
                        onChange={(e) => setEditForm({ ...editForm, priceKpr: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Jumlah Kamar Tidur</label>
                      <input
                        type="number"
                        value={editForm.bedrooms}
                        onChange={(e) => setEditForm({ ...editForm, bedrooms: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Jumlah Kamar Mandi</label>
                      <input
                        type="number"
                        value={editForm.bathrooms}
                        onChange={(e) => setEditForm({ ...editForm, bathrooms: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  {/* Spesifikasi Teknis Edit Section */}
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
                    <h5 className="font-bold text-amber-950 text-xs">Spesifikasi Material Bangunan</h5>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5">Pondasi</label>
                        <input
                          type="text"
                          value={editForm.specifications?.pondasi || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              specifications: { ...editForm.specifications, pondasi: e.target.value },
                            })
                          }
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5">Dinding</label>
                        <input
                          type="text"
                          value={editForm.specifications?.dinding || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              specifications: { ...editForm.specifications, dinding: e.target.value },
                            })
                          }
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5">Atap & Plafon</label>
                        <input
                          type="text"
                          value={editForm.specifications?.atap || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              specifications: { ...editForm.specifications, atap: e.target.value },
                            })
                          }
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5">Lantai</label>
                        <input
                          type="text"
                          value={editForm.specifications?.lantai || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              specifications: { ...editForm.specifications, lantai: e.target.value },
                            })
                          }
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5">Listrik</label>
                        <input
                          type="text"
                          value={editForm.specifications?.listrik || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              specifications: { ...editForm.specifications, listrik: e.target.value },
                            })
                          }
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5">Air Clean</label>
                        <input
                          type="text"
                          value={editForm.specifications?.air || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              specifications: { ...editForm.specifications, air: e.target.value },
                            })
                          }
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingSpecs(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg shadow-sm"
                    >
                      Simpan Spesifikasi Unit
                    </button>
                  </div>
                </form>
              ) : (
                /* READ ONLY SPEC VIEW */
                <>
                  {/* Status & Pricing Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Status Saat Ini</span>
                      <div className="mt-1">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getUnitStatusBadge(detailModalUnit.status).bg}`}>
                          {getUnitStatusBadge(detailModalUnit.status).label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Harga Cash Keras</span>
                      <div className="text-base font-extrabold text-slate-900 mt-0.5">
                        {formatRupiah(detailModalUnit.priceCash)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Harga Plafon KPR</span>
                      <div className="text-base font-extrabold text-amber-600 mt-0.5">
                        {formatRupiah(detailModalUnit.priceKpr)}
                      </div>
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-800">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-semibold">Tipe Rumah</div>
                      <div className="font-bold text-slate-900">{detailModalUnit.type}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-semibold">Luas Tanah / Bangunan</div>
                      <div className="font-bold text-slate-900">{detailModalUnit.landArea}m² / {detailModalUnit.buildingArea}m²</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-semibold">Arah Hadap / Kamar</div>
                      <div className="font-bold text-slate-900">{detailModalUnit.facing} | {detailModalUnit.bedrooms} KT, {detailModalUnit.bathrooms} KM</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-semibold">Min. DP / Booking Fee</div>
                      <div className="font-bold text-emerald-700">{formatRupiah(detailModalUnit.minDp)} / {formatRupiah(detailModalUnit.bookingFee)}</div>
                    </div>
                  </div>

                  {/* Technical Building Specifications */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
                      Spesifikasi Bangunan Standar Yusuf Property
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div><span className="text-slate-500">Pondasi:</span> <span className="font-semibold text-slate-800">{detailModalUnit.specifications.pondasi}</span></div>
                      <div><span className="text-slate-500">Dinding:</span> <span className="font-semibold text-slate-800">{detailModalUnit.specifications.dinding}</span></div>
                      <div><span className="text-slate-500">Atap:</span> <span className="font-semibold text-slate-800">{detailModalUnit.specifications.atap}</span></div>
                      <div><span className="text-slate-500">Lantai:</span> <span className="font-semibold text-slate-800">{detailModalUnit.specifications.lantai}</span></div>
                      <div><span className="text-slate-500">Listrik:</span> <span className="font-semibold text-slate-800">{detailModalUnit.specifications.listrik}</span></div>
                      <div><span className="text-slate-500">Air:</span> <span className="font-semibold text-slate-800">{detailModalUnit.specifications.air}</span></div>
                    </div>
                  </div>

                  {/* Change Status Quick Control */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <span className="font-bold text-amber-900 text-xs block">
                      Ubah Status Stok Unit:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          onUpdateUnitStatus(detailModalUnit.id, 'available');
                          setDetailModalUnit({ ...detailModalUnit, status: 'available' });
                        }}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700"
                      >
                        Set Tersedia
                      </button>
                      <button
                        onClick={() => {
                          onUpdateUnitStatus(detailModalUnit.id, 'booking');
                          setDetailModalUnit({ ...detailModalUnit, status: 'booking' });
                        }}
                        className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded text-[11px] font-bold hover:bg-amber-400"
                      >
                        Set Booking
                      </button>
                      <button
                        onClick={() => {
                          onUpdateUnitStatus(detailModalUnit.id, 'sold');
                          setDetailModalUnit({ ...detailModalUnit, status: 'sold' });
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700"
                      >
                        Set Terjual / Akad
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => setDetailModalUnit(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs"
              >
                Tutup
              </button>

              <button
                onClick={() => {
                  const unitToBook = detailModalUnit;
                  setDetailModalUnit(null);
                  onSelectUnitForSpr(unitToBook);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 active:scale-95"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Proses SPR / Pemesanan Unit Ini</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
