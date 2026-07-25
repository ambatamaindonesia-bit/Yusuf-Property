import React, { useState } from 'react';
import { HousingProject } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Building, MapPin, Plus, ArrowUpRight, Edit3, Trash2 } from 'lucide-react';

interface ProjectsManagerProps {
  projects: HousingProject[];
  onAddProject: (project: HousingProject) => void;
  onUpdateProject: (project: HousingProject) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectProjectForSiteplan: (projectId: string) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onSelectProjectForSiteplan,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<HousingProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<HousingProject | null>(null);

  // Form state for project
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [totalUnits, setTotalUnits] = useState(30);
  const [startingPrice, setStartingPrice] = useState(350000000);
  const [developerLegal, setDeveloperLegal] = useState('PT Yusuf Property Indonesia - SHM Induk & PBG');
  const [facilities, setFacilities] = useState('One Gate System, Security 24 Jam, Masjid Komplek');
  const [status, setStatus] = useState<'planning' | 'active' | 'sold_out' | 'handover'>('active');

  const handleOpenAdd = () => {
    setName('');
    setLocation('');
    setCity('');
    setTotalUnits(30);
    setStartingPrice(350000000);
    setDeveloperLegal('PT Yusuf Property Indonesia - SHM Induk & PBG');
    setFacilities('One Gate System, Security 24 Jam, Masjid Komplek');
    setStatus('active');
    setShowAddModal(true);
  };

  const handleOpenEdit = (proj: HousingProject) => {
    setEditingProject(proj);
    setName(proj.name);
    setLocation(proj.location);
    setCity(proj.city);
    setTotalUnits(proj.totalUnits);
    setStartingPrice(proj.startingPrice);
    setDeveloperLegal(proj.developerLegal);
    setFacilities(proj.facilities ? proj.facilities.join(', ') : '');
    setStatus(proj.status);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city) return;

    const facList = facilities ? facilities.split(',').map((f) => f.trim()).filter(Boolean) : [];

    if (editingProject) {
      const updated: HousingProject = {
        ...editingProject,
        name,
        location,
        city,
        totalUnits,
        developerLegal,
        startingPrice,
        facilities: facList,
        status,
      };
      onUpdateProject(updated);
      setEditingProject(null);
    } else {
      const newProj: HousingProject = {
        id: `proj-${Date.now()}`,
        name,
        location,
        city,
        totalUnits,
        unitsAvailable: totalUnits,
        unitsBooking: 0,
        unitsSold: 0,
        landSizeHa: 2.0,
        status: 'active',
        developerLegal,
        startingPrice,
        facilities: facList,
      };
      onAddProject(newProj);
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Master Proyek Perumahan Yusuf Property</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data perumahan, edit, hapus, dan buka perumahan baru milik PT Yusuf Property Indonesia.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buka Proyek Perumahan Baru</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Proyek Perumahan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sistem ERP dalam kondisi bersih/kosong. Silakan klik tombol "Buka Proyek Perumahan Baru" untuk menambahkan proyek perumahan pertama Anda.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-400 transition-all group"
            >
              {/* Top Banner Accent */}
              <div className="bg-slate-900 p-5 text-white space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950">
                    {proj.city}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition-colors"
                      title="Edit Proyek"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(proj)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                      title="Hapus Proyek"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors pt-1">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{proj.location || 'Lokasi belum diisi'}</span>
                </p>
              </div>

              {/* Project Details */}
              <div className="p-5 space-y-4 text-xs text-slate-700">
                
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Harga Mulai Dari</span>
                    <span className="font-extrabold text-slate-900 text-sm">{formatRupiah(proj.startingPrice)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Unit</span>
                    <span className="font-extrabold text-amber-600 text-sm">{proj.totalUnits} Kavling</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-900 block mb-1">Legalitas:</span>
                  <p className="text-[11px] text-slate-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 font-medium">
                    {proj.developerLegal || 'SHM & PBG Lengkap'}
                  </p>
                </div>

                {proj.facilities && proj.facilities.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Fasilitas Komplek:</span>
                    <div className="flex flex-wrap gap-1">
                      {proj.facilities.map((fac, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                          ✓ {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Terjual: {proj.unitsSold || 0} Unit</span>
                    <span>Tersedia: {proj.unitsAvailable ?? proj.totalUnits} Unit</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${((proj.unitsSold || 0) / (proj.totalUnits || 1)) * 100}%` }}
                    ></div>
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${((proj.unitsAvailable ?? proj.totalUnits) / (proj.totalUnits || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Card Action */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectProjectForSiteplan(proj.id)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <span>Buka Site Plan</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-rose-950 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm text-rose-200">Konfirmasi Hapus Proyek</span>
              <button
                onClick={() => setDeletingProject(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                ⚠️ Apakah Anda yakin ingin menghapus proyek perumahan <strong>"{deletingProject.name}"</strong>?
                <p className="mt-1 text-[11px] text-rose-700">
                  Seluruh data unit dan kavling yang terikat pada proyek ini juga akan dihapus dari sistem ERP.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProject(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteProject(deletingProject.id);
                    setDeletingProject(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  Ya, Hapus Proyek
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New / Edit Project Modal */}
      {(showAddModal || editingProject) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm">
                {editingProject ? 'Edit Proyek Perumahan' : 'Tambah Proyek Perumahan Baru'}
              </span>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProject(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Perumahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Yusuf Horizon Garden"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    placeholder="Bandung / Bogor"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Unit Rumah</label>
                  <input
                    type="number"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Alamat</label>
                <input
                  type="text"
                  placeholder="Jl. Raya Soekarno Hatta..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Mulai Dari (Rp)</label>
                  <input
                    type="number"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Legalitas Developer</label>
                  <input
                    type="text"
                    value={developerLegal}
                    onChange={(e) => setDeveloperLegal(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fasilitas (Dipisah koma)</label>
                <input
                  type="text"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Proyek</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="active">Aktif Dipasarkan</option>
                  <option value="planning">Tahap Perencanaan</option>
                  <option value="sold_out">Sold Out / Habis</option>
                  <option value="handover">Tahap Serah Terima</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  {editingProject ? 'Simpan Perubahan' : 'Simpan Proyek Baru'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
