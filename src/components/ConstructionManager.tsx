import React, { useState } from 'react';
import {
  ConstructionMilestone,
  HousingProject,
  Unit,
  MaterialItem,
  MaterialUsageRecord,
  ProgressDocumentation,
  ExecutorType,
  AppUser,
} from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  HardHat,
  Package,
  Boxes,
  Truck,
  Camera,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  Edit3,
  Trash2,
  CheckCircle2,
  Building2,
  UserCheck,
  FileText,
  AlertTriangle,
  History,
  Eye,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Tag,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface ConstructionManagerProps {
  construction: ConstructionMilestone[];
  projects: HousingProject[];
  units: Unit[];
  materials: MaterialItem[];
  materialUsages: MaterialUsageRecord[];
  progressDocs: ProgressDocumentation[];
  onUpdateProgress: (id: string, newProgress: number) => void;
  onAddMaterial: (mat: MaterialItem) => void;
  onUpdateMaterial: (mat: MaterialItem) => void;
  onDeleteMaterial: (id: string) => void;
  onAddMaterialUsage: (usage: MaterialUsageRecord) => void;
  onUpdateMaterialUsage: (usage: MaterialUsageRecord, oldQty: number) => void;
  onDeleteMaterialUsage: (id: string) => void;
  onAddProgressDoc: (doc: ProgressDocumentation) => void;
  onDeleteProgressDoc: (id: string) => void;
  currentUser?: AppUser | null;
}

export const ConstructionManager: React.FC<ConstructionManagerProps> = ({
  construction,
  projects,
  units,
  materials,
  materialUsages,
  progressDocs,
  onUpdateProgress,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onAddMaterialUsage,
  onUpdateMaterialUsage,
  onDeleteMaterialUsage,
  onAddProgressDoc,
  onDeleteProgressDoc,
  currentUser,
}) => {
  // Main Sub-Tab State
  const [activeSubTab, setActiveSubTab] = useState<
    'spk_progress' | 'material_stock' | 'material_usages' | 'progress_docs'
  >('spk_progress');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all');

  // Construction Milestone Editing
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);

  // Modals State
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showInputUsageModal, setShowInputUsageModal] = useState(false);
  const [editingUsageRecord, setEditingUsageRecord] = useState<MaterialUsageRecord | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<MaterialUsageRecord | null>(null);

  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // --- Form States: Material Baru ---
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState('Sak');
  const [matStock, setMatStock] = useState<number | ''>(100);
  const [matUnitPrice, setMatUnitPrice] = useState<number | ''>(50000);
  const [matProjectName, setMatProjectName] = useState(projects[0]?.name || 'Grand Yusuf Residence');

  // --- Form States: Pemakaian Material ---
  const [useMaterialId, setUseMaterialId] = useState('');
  const [useUnitId, setUseUnitId] = useState('');
  const [useQty, setUseQty] = useState<number | ''>(1);
  const [useDate, setUseDate] = useState(new Date().toISOString().split('T')[0]);
  const [usePerson, setUsePerson] = useState(currentUser?.name || 'Mandor Supri');
  const [useReason, setUseReason] = useState('');
  const [editReasonInput, setEditReasonInput] = useState('');

  // --- Form States: Dokumentasi Foto Progress Mandor ---
  const [progUnitId, setProgUnitId] = useState('');
  const [progExecutorType, setProgExecutorType] = useState<ExecutorType>('Inhouse');
  const [progExecutorName, setProgExecutorName] = useState('Tim Mandor Supri (Internal)');
  const [progInspectionDate, setProgInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [progStageName, setProgStageName] = useState('Pekerjaan Pondasi & Dinding');
  const [progPercent, setProgPercent] = useState<number>(50);
  const [progPhotoUrl, setProgPhotoUrl] = useState('');
  const [progConditionNotes, setProgConditionNotes] = useState('');
  const [progCheckedBy, setProgCheckedBy] = useState(currentUser?.name || 'Mandor Supri');

  // Sample Presets for Photos
  const samplePhotos = [
    { label: 'Pondasi & Sloof', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=800&auto=format&fit=crop&q=80' },
    { label: 'Rangka Atap & Dinding', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80' },
    { label: 'Finishing Cat & Keramik', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80' },
  ];

  // Calculated Summary Metrics
  const totalMaterialTypes = materials.length;
  const totalStockValue = materials.reduce((acc, m) => acc + m.stockQty * m.unitPrice, 0);
  const lowStockCount = materials.filter((m) => m.stockQty <= 20).length;
  const totalUsagesCount = materialUsages.length;
  const totalProgressDocsCount = progressDocs.length;

  // Filtered lists
  const filteredMaterials = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProj = selectedProjectFilter === 'all' || m.projectName === selectedProjectFilter;
    return matchSearch && matchProj;
  });

  const filteredUsages = materialUsages.filter((u) => {
    const matchSearch =
      u.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.reasonUsage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.personInCharge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProj = selectedProjectFilter === 'all' || u.projectName === selectedProjectFilter;
    const matchUnit = selectedUnitFilter === 'all' || u.unitId === selectedUnitFilter;
    return matchSearch && matchProj && matchUnit;
  });

  const filteredDocs = progressDocs.filter((d) => {
    const matchSearch =
      d.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.executorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.conditionNotes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.stageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProj = selectedProjectFilter === 'all' || d.projectName === selectedProjectFilter;
    const matchUnit = selectedUnitFilter === 'all' || d.unitId === selectedUnitFilter;
    return matchSearch && matchProj && matchUnit;
  });

  // Reset Material Form
  const resetMaterialForm = () => {
    setMatName('');
    setMatCategory('Sak');
    setMatStock(100);
    setMatUnitPrice(50000);
    setMatProjectName(projects[0]?.name || 'Grand Yusuf Residence');
  };

  // Submit New Material
  const handleSaveNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName || matStock === '' || matUnitPrice === '') return;

    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      name: matName,
      unitCategory: matCategory,
      stockQty: Number(matStock),
      unitPrice: Number(matUnitPrice),
      projectName: matProjectName,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onAddMaterial(newMat);
    setShowAddMaterialModal(false);
    resetMaterialForm();
  };

  // Reset Usage Form
  const resetUsageForm = () => {
    setUseMaterialId(materials[0]?.id || '');
    setUseUnitId(units[0]?.id || '');
    setUseQty(1);
    setUseDate(new Date().toISOString().split('T')[0]);
    setUsePerson(currentUser?.name || 'Mandor Supri');
    setUseReason('');
    setEditReasonInput('');
    setEditingUsageRecord(null);
  };

  // Open Input Usage Modal
  const handleOpenInputUsage = (selectedMatId?: string) => {
    resetUsageForm();
    if (selectedMatId) setUseMaterialId(selectedMatId);
    setShowInputUsageModal(true);
  };

  // Open Edit Usage Modal
  const handleOpenEditUsage = (record: MaterialUsageRecord) => {
    setEditingUsageRecord(record);
    setUseMaterialId(record.materialId);
    setUseUnitId(record.unitId);
    setUseQty(record.quantityUsed);
    setUseDate(record.usageDate);
    setUsePerson(record.personInCharge);
    setUseReason(record.reasonUsage);
    setEditReasonInput('');
    setShowInputUsageModal(true);
  };

  // Submit Usage Form (New or Edit with MANDATORY Edit Reason)
  const handleSaveUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!useMaterialId || !useUnitId || useQty === '' || Number(useQty) <= 0 || !useReason) return;

    const selectedMat = materials.find((m) => m.id === useMaterialId);
    const selectedUnit = units.find((u) => u.id === useUnitId);

    if (!selectedMat || !selectedUnit) {
      alert('Pilih material dan unit perumahan terlebih dahulu!');
      return;
    }

    if (editingUsageRecord) {
      // EDIT MODE - REQUIRE MANDATORY EDIT REASON
      if (!editReasonInput.trim()) {
        alert('WAJIB memasukkan alasan perubahan / keterangan revisi pemakaian material!');
        return;
      }

      const oldQty = editingUsageRecord.quantityUsed;
      const historyItem = {
        editedAt: new Date().toISOString(),
        editedBy: currentUser?.name || 'Admin',
        editReason: editReasonInput,
        prevQuantity: oldQty,
        prevUnitCode: editingUsageRecord.unitCode,
        prevReasonUsage: editingUsageRecord.reasonUsage,
      };

      const updatedRecord: MaterialUsageRecord = {
        ...editingUsageRecord,
        materialId: selectedMat.id,
        materialName: selectedMat.name,
        unitCategory: selectedMat.unitCategory,
        projectName: selectedUnit.projectName,
        unitId: selectedUnit.id,
        unitCode: `${selectedUnit.projectName} - ${selectedUnit.block} No. ${selectedUnit.number}`,
        quantityUsed: Number(useQty),
        usageDate: useDate,
        personInCharge: usePerson,
        reasonUsage: useReason,
        editHistory: [historyItem, ...(editingUsageRecord.editHistory || [])],
      };

      onUpdateMaterialUsage(updatedRecord, oldQty);
    } else {
      // NEW USAGE MODE
      if (selectedMat.stockQty < Number(useQty)) {
        alert(`Stok material "${selectedMat.name}" tidak mencukupi! Stok saat ini: ${selectedMat.stockQty} ${selectedMat.unitCategory}`);
        return;
      }

      const newRecord: MaterialUsageRecord = {
        id: `usg-${Date.now()}`,
        materialId: selectedMat.id,
        materialName: selectedMat.name,
        unitCategory: selectedMat.unitCategory,
        projectName: selectedUnit.projectName,
        unitId: selectedUnit.id,
        unitCode: `Blok ${selectedUnit.block} No. ${selectedUnit.number}`,
        quantityUsed: Number(useQty),
        usageDate: useDate,
        personInCharge: usePerson,
        reasonUsage: useReason,
        createdAt: new Date().toISOString(),
      };

      onAddMaterialUsage(newRecord);
    }

    setShowInputUsageModal(false);
    resetUsageForm();
  };

  // Reset Progress Doc Form
  const resetProgressForm = () => {
    setProgUnitId(units[0]?.id || '');
    setProgExecutorType('Inhouse');
    setProgExecutorName('Tim Mandor Supri (Internal Developer)');
    setProgInspectionDate(new Date().toISOString().split('T')[0]);
    setProgStageName('Pekerjaan Dinding & Rangka Atap');
    setProgPercent(50);
    setProgPhotoUrl('');
    setProgConditionNotes('');
    setProgCheckedBy(currentUser?.name || 'Mandor Supri');
  };

  // Handle Photo Upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProgPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Progress Documentation
  const handleSaveProgressDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progUnitId || !progConditionNotes) {
      alert('Mohon pilih unit rumah dan isi catatan kondisi fisik hasil pemeriksaan mandor!');
      return;
    }

    const selectedUnit = units.find((u) => u.id === progUnitId);
    if (!selectedUnit) return;

    const newDoc: ProgressDocumentation = {
      id: `doc-prog-${Date.now()}`,
      projectName: selectedUnit.projectName,
      unitId: selectedUnit.id,
      unitCode: `Blok ${selectedUnit.block} No. ${selectedUnit.number}`,
      executorType: progExecutorType,
      executorName: progExecutorName || (progExecutorType === 'Inhouse' ? 'Mandor Internal Developer' : 'Kontraktor Eksternal'),
      inspectionDate: progInspectionDate,
      stageName: progStageName,
      progressPercent: Number(progPercent),
      photoUrl: progPhotoUrl || samplePhotos[0].url,
      conditionNotes: progConditionNotes,
      checkedBy: progCheckedBy,
      createdAt: new Date().toISOString(),
    };

    onAddProgressDoc(newDoc);
    setShowAddProgressModal(false);
    resetProgressForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Main Banner / Header */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Manajemen Konstruksi, Stok Material & Progress Mandor
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring fisik pembangunan unit rumah, pelacakan pemakaian material per unit kavling, serta dokumentasi foto mandor.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenInputUsage()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all"
          >
            <Boxes className="w-4 h-4" />
            <span>Catat Pemakaian Material</span>
          </button>

          <button
            onClick={() => {
              resetProgressForm();
              setShowAddProgressModal(true);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs border border-slate-700 shadow-md flex items-center gap-2 transition-all"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Upload Foto Progress</span>
          </button>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveSubTab('spk_progress')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'spk_progress'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Progress Fisik & SPK Mandor</span>
        </button>

        <button
          onClick={() => setActiveSubTab('material_stock')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'material_stock'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stok Material Gudang [{totalMaterialTypes}]</span>
        </button>

        <button
          onClick={() => setActiveSubTab('material_usages')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'material_usages'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Pelacakan Pemakaian per Unit [{totalUsagesCount}]</span>
        </button>

        <button
          onClick={() => setActiveSubTab('progress_docs')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'progress_docs'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Foto Progress Mandor [{totalProgressDocsCount}]</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari material, unit kavling, mandor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-500">Proyek:</span>
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Proyek</option>
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Filter */}
          {(activeSubTab === 'material_usages' || activeSubTab === 'progress_docs') && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-500">Unit Kavling:</span>
              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">Semua Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Blok {u.block} No. {u.number} ({u.type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: PROGRESS FISIK & SPK MANDOR */}
      {activeSubTab === 'spk_progress' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {construction.length === 0 ? (
              <div className="col-span-2 bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
                <HardHat className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Belum Ada SPK Konstruksi Berjalan</p>
                <p className="text-xs text-slate-500">Data SPK mandor dan milestone akan muncul setelah unit rumah dalam status pembangunan.</p>
              </div>
            ) : (
              construction.map((item) => {
                const isEditing = editingMilestoneId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-slate-900 text-amber-400 font-black text-xs rounded">
                            {item.unitCode}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{item.projectName}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Mandor/Kontraktor: <span className="text-slate-800 font-semibold">{item.contractorName}</span>
                        </p>
                      </div>

                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Dalam Pembangunan
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                      <span className="text-slate-500 font-medium">Tahap Pekerjaan Saat Ini:</span>
                      <div className="font-bold text-slate-900 text-sm">{item.stageName}</div>
                      <div className="text-slate-500 flex items-center gap-1 text-[11px] pt-1">
                        <Calendar className="w-3 h-3 text-amber-600" /> Target Selesai: {item.targetCompletionDate}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">Progres Lapangan:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-amber-600 text-sm">
                            {isEditing ? tempProgress : item.progressPercent}%
                          </span>
                          {!isEditing ? (
                            <button
                              onClick={() => {
                                setEditingMilestoneId(item.id);
                                setTempProgress(item.progressPercent);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Update Progres"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onUpdateProgress(item.id, tempProgress);
                                setEditingMilestoneId(null);
                              }}
                              className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Simpan
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={tempProgress}
                          onChange={(e) => setTempProgress(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      ) : (
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.progressPercent}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Alokasi RAB:</span>
                        <span className="font-bold text-slate-800">{formatRupiah(item.budgetAllocated)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Tercapai / Terpakai:</span>
                        <span className="font-bold text-emerald-700">{formatRupiah(item.budgetSpent)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STOK BAHAN MATERIAL GUDANG */}
      {activeSubTab === 'material_stock' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Total Jenis Material Gudang</p>
                <h3 className="text-2xl font-black text-slate-900">{totalMaterialTypes} Material</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Total Estimasi Nilai Persediaan</p>
                <h3 className="text-2xl font-black text-emerald-700">{formatRupiah(totalStockValue)}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Peringatan Stok Menipis</p>
                <h3 className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {lowStockCount} Material
                </h3>
              </div>
            </div>
          </div>

          {/* Table Header & Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Daftar Stok Bahan Bangunan Material yang Tersedia</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Menampilkan ketersediaan stok fisik di gudang proyek perumahan developer.
                </p>
              </div>

              <button
                onClick={() => {
                  resetMaterialForm();
                  setShowAddMaterialModal(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Stok Material Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <th className="p-3.5">Proyek Perumahan</th>
                    <th className="p-3.5">Nama Bahan Material</th>
                    <th className="p-3.5">Satuan Ukuran</th>
                    <th className="p-3.5">Jumlah Stok Fisik</th>
                    <th className="p-3.5">Harga Satuan (Rp)</th>
                    <th className="p-3.5">Total Nilai Stok</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada data material yang cocok. Silakan tambah material baru.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((mat) => {
                      const isLow = mat.stockQty <= 20;
                      return (
                        <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{mat.projectName}</td>
                          <td className="p-3.5 font-extrabold text-amber-950 text-sm">{mat.name}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded border border-slate-200">
                              {mat.unitCategory}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                                isLow ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {mat.stockQty} {mat.unitCategory}
                            </span>
                            {isLow && <span className="text-[10px] text-rose-600 font-bold ml-1.5">(Menipis)</span>}
                          </td>
                          <td className="p-3.5 font-bold">{formatRupiah(mat.unitPrice)}</td>
                          <td className="p-3.5 font-black text-emerald-700">
                            {formatRupiah(mat.stockQty * mat.unitPrice)}
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => handleOpenInputUsage(mat.id)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] shadow-xs transition-all"
                            >
                              Pakai Material
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus material "${mat.name}" dari master stok?`)) {
                                  onDeleteMaterial(mat.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Hapus Material"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PELACAKAN PEMAKAIAN MATERIAL PER UNIT */}
      {activeSubTab === 'material_usages' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-500" />
                  <span>Riwayat & Pelacakan Pemakaian Material per Unit Rumah / Kavling</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Setiap pemakaian material tercatat secara spesifik untuk unit rumah mana beserta alasan pemakaian dan riwayat perubahan.
                </p>
              </div>

              <button
                onClick={() => handleOpenInputUsage()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Input Pemakaian Material Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Unit Rumah / Kavling</th>
                    <th className="p-3.5">Bahan Material</th>
                    <th className="p-3.5">Jumlah Digunakan</th>
                    <th className="p-3.5">Mandor / PJ</th>
                    <th className="p-3.5">Alasan & Tujuan Pemakaian</th>
                    <th className="p-3.5">History Edit</th>
                    <th className="p-3.5 text-right">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredUsages.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Belum ada catatan pemakaian material yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsages.map((usage) => {
                      const hasHistory = usage.editHistory && usage.editHistory.length > 0;
                      return (
                        <tr key={usage.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">{usage.usageDate}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 bg-slate-900 text-amber-400 font-black rounded-md text-xs inline-block">
                              {usage.unitCode}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{usage.projectName}</div>
                          </td>
                          <td className="p-3.5 font-extrabold text-slate-900">{usage.materialName}</td>
                          <td className="p-3.5">
                            <span className="font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs">
                              {usage.quantityUsed} {usage.unitCategory}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">{usage.personInCharge}</td>
                          <td className="p-3.5 text-slate-600 max-w-xs leading-relaxed">
                            {usage.reasonUsage}
                          </td>
                          <td className="p-3.5">
                            {hasHistory ? (
                              <button
                                onClick={() => setShowHistoryModal(usage)}
                                className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-black rounded flex items-center gap-1 border border-purple-200 transition-colors"
                              >
                                <History className="w-3 h-3" />
                                <span>Diedit ({usage.editHistory?.length}x)</span>
                              </button>
                            ) : (
                              <span className="text-slate-300 text-[10px] font-mono">Original</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditUsage(usage)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] border border-slate-300 transition-all inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus catatan pemakaian material ini? Stok akan dikembalikan.`)) {
                                  onDeleteMaterialUsage(usage.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Hapus Pemakaian"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DOKUMENTASI FOTO PROGRESS MANDOR */}
      {activeSubTab === 'progress_docs' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-500" />
                <span>Dokumentasi Foto Progress Bangunan Hasil Check Mandor</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dokumentasi pemeriksaan fisik oleh mandor internal atau kontraktor eksternal beserta bukti foto dan kondisi tanggal update.
              </p>
            </div>

            <button
              onClick={() => {
                resetProgressForm();
                setShowAddProgressModal(true);
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Dokumentasi Foto Progress Baru</span>
            </button>
          </div>

          {/* Cards Grid Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <Camera className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Belum Ada Foto Progress Tersimpan</p>
                <p className="text-xs text-slate-500">
                  Klik tombol "Tambah Dokumentasi Foto Progress Baru" untuk mengunggah foto inspeksi mandor.
                </p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-amber-400 transition-all"
                >
                  {/* Image Preview Container */}
                  <div className="relative h-48 bg-slate-900 group overflow-hidden">
                    {doc.photoUrl ? (
                      <img
                        src={doc.photoUrl}
                        alt={`Progress ${doc.unitCode}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}

                    {/* Image Overlay Badge */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-400 font-black text-xs rounded-lg border border-slate-700 shadow-md">
                        {doc.unitCode}
                      </span>
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg border shadow-md backdrop-blur-md ${
                          doc.executorType === 'Inhouse'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            : 'bg-blue-950/80 text-blue-300 border-blue-700'
                        }`}
                      >
                        {doc.executorType === 'Inhouse' ? 'Inhouse (Mandor)' : 'Kontraktor'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <button
                        onClick={() => doc.photoUrl && setPreviewImageModal(doc.photoUrl)}
                        className="px-2.5 py-1 bg-slate-900/80 text-white hover:bg-slate-900 rounded-lg text-[10px] font-bold backdrop-blur-md flex items-center gap-1 border border-slate-700 transition-all"
                      >
                        <Eye className="w-3 h-3" /> Zoom Foto
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{doc.stageName}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{doc.projectName}</p>
                        </div>
                        <span className="px-2 py-1 bg-amber-50 text-amber-900 font-black text-xs rounded-lg border border-amber-200">
                          {doc.progressPercent}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${doc.progressPercent}%` }}
                        ></div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs leading-relaxed space-y-1">
                        <span className="font-extrabold text-slate-900 text-[10px] uppercase block">
                          Catatan Inspeksi Mandor:
                        </span>
                        <p className="italic text-slate-600 font-medium">"{doc.conditionNotes}"</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1 truncate max-w-[180px]">
                        <UserCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate">{doc.executorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{doc.inspectionDate}</span>
                        <button
                          onClick={() => {
                            if (confirm('Hapus dokumentasi foto progress ini?')) {
                              onDeleteProgressDoc(doc.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH MATERIAL BARU */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 px-5 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base">Tambah Stok Bahan Material Baru</h3>
              </div>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewMaterial} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Proyek Perumahan *</label>
                <select
                  value={matProjectName}
                  onChange={(e) => setMatProjectName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Bahan Material *</label>
                <input
                  type="text"
                  placeholder="misal: Semen Tiga Roda 50kg, Besi Beton 10mm"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan Ukuran *</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Sak">Sak (Semen/Mortar)</option>
                    <option value="Batang">Batang (Besi/Baja)</option>
                    <option value="M3">M3 (Pasir/Batu/Hebel)</option>
                    <option value="Truk">Truk / Engkel</option>
                    <option value="Dus">Dus (Keramik/Granit)</option>
                    <option value="Roll">Roll (Kabel/Kawat)</option>
                    <option value="Pcs">Pcs / Lembar</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stok Awal Fisik *</label>
                  <input
                    type="number"
                    min={0}
                    value={matStock}
                    onChange={(e) => setMatStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Harga Satuan Estimasi (Rp) *</label>
                <input
                  type="number"
                  min={0}
                  value={matUnitPrice}
                  onChange={(e) => setMatUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold rounded-xl border border-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl shadow-md"
                >
                  Simpan Material Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INPUT / EDIT PEMAKAIAN MATERIAL PER UNIT */}
      {showInputUsageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 px-5 py-4 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {editingUsageRecord ? 'Edit Catatan Pemakaian Material' : 'Catat Pemakaian Material per Unit Rumah'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowInputUsageModal(false);
                  resetUsageForm();
                }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUsage} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              {/* Material Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">1. Pilih Bahan Material yang Dipakai *</label>
                <select
                  value={useMaterialId}
                  onChange={(e) => setUseMaterialId(e.target.value)}
                  className="w-full p-2.5 bg-amber-50 border border-amber-300 rounded-xl font-extrabold text-amber-950 focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Material dari Gudang --</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — Stok Tersedia: {m.stockQty} {m.unitCategory} ({m.projectName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Selection from Housing Stock */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  2. Pilih Unit Rumah / Kavling yang Menggunakan (Dari Stok Unit) *
                </label>
                <select
                  value={useUnitId}
                  onChange={(e) => setUseUnitId(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 text-amber-400 font-extrabold border border-slate-800 rounded-xl focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Unit Kavling Perumahan --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.projectName} — Blok {u.block} No. {u.number} ({u.type}) - Progress: {u.progressPercent}%
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Digunakan *</label>
                  <input
                    type="number"
                    min={1}
                    value={useQty}
                    onChange={(e) => setUseQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-extrabold text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Pemakaian *</label>
                  <input
                    type="date"
                    value={useDate}
                    onChange={(e) => setUseDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mandor / Penanggung Jawab Lapangan *</label>
                <input
                  type="text"
                  placeholder="Nama Mandor / Supv"
                  value={usePerson}
                  onChange={(e) => setUsePerson(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alasan & Keterangan Pemakaian Spesifik *
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Sebanyak 5 sak semen digunakan untuk pengecoran sloof pondasi Blok A No. 01"
                  value={useReason}
                  onChange={(e) => setUseReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  required
                />
              </div>

              {/* MANDATORY EDIT REASON FIELD IF EDITING */}
              {editingUsageRecord && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                  <label className="font-black text-rose-950 block text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>ALASAN EDIT / KETERANGAN REVISI (WAJIB DIISEKAN) *</span>
                  </label>
                  <p className="text-[11px] text-rose-800">
                    Sebutkan alasan mengapa data pemakaian material ini diubah/direvisi untuk dicatat dalam audit trail history.
                  </p>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Koreksi jumlah sak semen dari 8 sak menjadi 5 sak karena sisa dari blok sebelah"
                    value={editReasonInput}
                    onChange={(e) => setEditReasonInput(e.target.value)}
                    className="w-full p-2.5 bg-white border border-rose-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowInputUsageModal(false);
                    resetUsageForm();
                  }}
                  className="px-4 py-2.5 text-slate-700 font-bold rounded-xl border border-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md"
                >
                  {editingUsageRecord ? 'Simpan Perubahan & Catat Revisi' : 'Simpan Pemakaian Material'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AUDIT TRAIL HISTORY EDIT PEMAKAIAN */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="bg-purple-900 px-5 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-300" />
                <h3 className="font-extrabold text-sm sm:text-base">Riwayat Perubahan / Edit Pemakaian Material</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(null)}
                className="text-purple-300 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="font-extrabold text-purple-950">{showHistoryModal.materialName}</div>
                <div className="text-[11px] text-purple-800 font-bold">
                  Target: {showHistoryModal.unitCode} ({showHistoryModal.projectName})
                </div>
              </div>

              <div className="space-y-3">
                {showHistoryModal.editHistory?.map((h, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1">
                      <span>Diubah oleh: {h.editedBy}</span>
                      <span>{new Date(h.editedAt).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="pt-1 font-bold text-rose-900">
                      Alasan Revisi: <span className="font-normal text-slate-800">"{h.editReason}"</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Jumlah Sebelumnya: <span className="font-extrabold text-slate-900">{h.prevQuantity}</span> | Alasan Awal: "{h.prevReasonUsage}"
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowHistoryModal(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
                >
                  Tutup History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DOKUMENTASI FOTO PROGRESS MANDOR */}
      {showAddProgressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 px-5 py-4 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base">Dokumentasi Foto Progress Mandor Lapangan</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddProgressModal(false);
                  resetProgressForm();
                }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgressDoc} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              {/* Option: Inhouse vs Kontraktor */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-slate-800 block text-xs">
                  1. Pelaksana Pekerjaan Konstruksi *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setProgExecutorType('Inhouse')}
                    className={`p-3 rounded-xl border font-bold cursor-pointer flex items-center gap-2 transition-all ${
                      progExecutorType === 'Inhouse'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/30'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="executorType"
                      checked={progExecutorType === 'Inhouse'}
                      onChange={() => setProgExecutorType('Inhouse')}
                      className="text-emerald-600 focus:ring-emerald-400"
                    />
                    <div>
                      <div className="text-xs font-black">Inhouse (Mandor Internal)</div>
                      <div className="text-[10px] text-slate-500 font-normal">Dikelola internal developer</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setProgExecutorType('Kontraktor')}
                    className={`p-3 rounded-xl border font-bold cursor-pointer flex items-center gap-2 transition-all ${
                      progExecutorType === 'Kontraktor'
                        ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-400/30'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="executorType"
                      checked={progExecutorType === 'Kontraktor'}
                      onChange={() => setProgExecutorType('Kontraktor')}
                      className="text-blue-600 focus:ring-blue-400"
                    />
                    <div>
                      <div className="text-xs font-black">Kontraktor Eksternal</div>
                      <div className="text-[10px] text-slate-500 font-normal">Pemborong / Subkontraktor</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Mandor / Pemborong *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Mandor Supri / CV Karya Utama"
                    value={progExecutorName}
                    onChange={(e) => setProgExecutorName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pilih Unit Rumah (Dari Stok Unit) *</label>
                  <select
                    value={progUnitId}
                    onChange={(e) => setProgUnitId(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 text-amber-400 font-extrabold border border-slate-800 rounded-xl focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Unit Kavling --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.projectName} — Blok {u.block} No. {u.number} ({u.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Inspeksi Check *</label>
                  <input
                    type="date"
                    value={progInspectionDate}
                    onChange={(e) => setProgInspectionDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahap / Item Pekerjaan *</label>
                  <input
                    type="text"
                    placeholder="misal: Rangka Atap & Dinding"
                    value={progStageName}
                    onChange={(e) => setProgStageName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capaian Progress (%) *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={progPercent}
                    onChange={(e) => setProgPercent(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-black text-amber-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Upload Foto Progress */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Upload Foto Progress Bangunan Mandor</label>
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Upload className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Upload file foto dari perangkat lokal</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                    id="photo-file-input"
                  />
                  <label
                    htmlFor="photo-file-input"
                    className="inline-block px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    Pilih File Foto
                  </label>

                  <p className="text-[10px] text-slate-400">Atau gunakan foto contoh sampel di bawah ini:</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    {samplePhotos.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProgPhotoUrl(s.url)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:border-amber-400 text-slate-700 text-[10px] font-bold rounded-lg shadow-2xs"
                      >
                        Sampel: {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {progPhotoUrl && (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-slate-300">
                    <img src={progPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProgPhotoUrl('')}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Condition Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Kondisi Update & Dokumentasi Mandor Lapangan *
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail penjelasan kondisi fisik di lapangan. Misal: Pemasangan hebel selesai 100%, plester aci 50%, siap untuk pemasangan kramik."
                  value={progConditionNotes}
                  onChange={(e) => setProgConditionNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProgressModal(false);
                    resetProgressForm();
                  }}
                  className="px-4 py-2.5 text-slate-700 font-bold rounded-xl border border-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Dokumentasi Progress</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: IMAGE ZOOM PREVIEW */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700">
            <img src={previewImageModal} alt="Enlarged progress" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full font-bold border border-slate-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
