import React, { useState, useRef, useEffect } from 'react';
import {
  ProspectRecord,
  ProspectSource,
  ProspectStatus,
  ProspectFollowUp,
  HousingProject,
  AppUser,
} from '../types';
import {
  UserPlus,
  Search,
  Filter,
  Plus,
  MapPin,
  Camera,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Share2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ChevronRight,
  ExternalLink,
  Tag,
  Users,
  Navigation,
  Eye,
  X,
  History,
  Send,
  Bell,
  Sparkles,
  Upload,
  Video,
  RotateCcw,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

interface ProspectsManagerProps {
  prospects: ProspectRecord[];
  onAddProspect: (prospect: ProspectRecord) => void;
  onUpdateProspect: (updated: ProspectRecord) => void;
  projects: HousingProject[];
  currentUser: AppUser | null;
}

export const ProspectsManager: React.FC<ProspectsManagerProps> = ({
  prospects,
  onAddProspect,
  onUpdateProspect,
  projects,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProspectDetail, setSelectedProspectDetail] = useState<ProspectRecord | null>(null);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // --- Add Prospect Form State ---
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [source, setSource] = useState<ProspectSource>('Iklan Medsos');
  const [sourceReferenceDetail, setSourceReferenceDetail] = useState('');
  const [status, setStatus] = useState<ProspectStatus>('Berminat');
  const [projectNameInterest, setProjectNameInterest] = useState(projects[0]?.name || 'Grand Yusuf Residence');
  const [preferredUnitType, setPreferredUnitType] = useState('Tipe 36/72 - 2 Kamar');
  const [photoUrl, setPhotoUrl] = useState('');
  const [locationName, setLocationName] = useState('Gallery Pemasaran / Lokasi Proyek');
  const [locationAddress, setLocationAddress] = useState('Jl. Utama Proyek (-6.2891, 106.8251)');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: -6.2891, lng: 106.8251 });
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Notification / Follow-up State
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [nextFollowUpTime, setNextFollowUpTime] = useState('10:00');
  const [nextFollowUpType, setNextFollowUpType] = useState<'Janji Ketemuan Lagi' | 'Telepon / WA Follow Up' | 'Survey Lokasi' | 'Negosiasi Harga'>('Janji Ketemuan Lagi');
  const [nextFollowUpNotes, setNextFollowUpNotes] = useState('Janji temu & survey lokasi dengan konsumen');
  const [notes, setNotes] = useState('');

  // New Follow Up Log inside detail modal
  const [newLogType, setNewLogType] = useState<'Janji Ketemuan Lagi' | 'Telepon / WA Follow Up' | 'Survey Lokasi' | 'Negosiasi Harga'>('Telepon / WA Follow Up');
  const [newLogNotes, setNewLogNotes] = useState('');
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLogNextDate, setNewLogNextDate] = useState('');

  // Sample Photo Presets
  const samplePhotos = [
    {
      label: 'Pertemuan di Marketing Gallery',
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Survey Lokasi Kaveling Proyek',
      url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Diskusi Brosur & Denah Rumah',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Pertemuan Pameran Mall',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    },
  ];

  // Camera & File Upload Refs & State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photoSourceType, setPhotoSourceType] = useState<'upload' | 'camera' | 'preset' | 'url'>('preset');

  // Stop media stream on unmount or when camera closed
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleStartLiveCamera = async () => {
    setCameraError(null);
    setIsLiveCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing live camera:', err);
      setCameraError('Gagal mengakses webcam browser secara langsung. Anda dapat memilih tombol "Kamera HP Native" atau "Upload File Foto".');
    }
  };

  const handleStopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsLiveCameraOpen(false);
    setCameraError(null);
  };

  const handleCaptureLivePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrl(dataUrl);
        setPhotoSourceType('camera');
        handleStopLiveCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setPhotoSourceType('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetGpsLocation = () => {
    setIsGettingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          setCoordinates({ lat, lng });
          setLocationAddress(`GPS Terverifikasi (${lat}, ${lng}) - Alamat Lokasi Marketing`);
          setIsGettingGps(false);
        },
        (err) => {
          console.warn('Geolocation error or denied:', err);
          // Fallback location
          const lat = -6.2088;
          const lng = 106.8456;
          setCoordinates({ lat, lng });
          setLocationAddress(`GPS Default (${lat}, ${lng}) - Galeri Pemasaran Utama`);
          setIsGettingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsGettingGps(false);
    }
  };

  const handleResetForm = () => {
    handleStopLiveCamera();
    setName('');
    setPhone('');
    setAddress('');
    setSource('Iklan Medsos');
    setSourceReferenceDetail('');
    setStatus('Berminat');
    setProjectNameInterest(projects[0]?.name || 'Grand Yusuf Residence');
    setPreferredUnitType('Tipe 36/72 - 2 Kamar');
    setPhotoUrl('');
    setLocationName('Gallery Pemasaran / Lokasi Proyek');
    setLocationAddress('Jl. Utama Proyek (-6.2891, 106.8251)');
    setCoordinates({ lat: -6.2891, lng: 106.8251 });
    setNextFollowUpDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
    setNextFollowUpTime('10:00');
    setNextFollowUpType('Janji Ketemuan Lagi');
    setNextFollowUpNotes('Janji temu & survey lokasi dengan konsumen');
    setNotes('');
  };

  const handleSubmitNewProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Nama dan No. Telepon calon user / prospect wajib diisi!');
      return;
    }

    const newProspect: ProspectRecord = {
      id: `prosp-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Alamat belum diisi',
      source,
      sourceReferenceDetail: source === 'Referensi' ? sourceReferenceDetail.trim() : undefined,
      status,
      projectNameInterest,
      preferredUnitType,
      agentId: currentUser?.id || 'usr-sales',
      agentName: currentUser?.name || 'Agus Marketing',
      agentRole: currentUser?.role || 'Sales Marketing',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80',
      locationName,
      locationAddress,
      coordinates,
      nextFollowUpDate,
      nextFollowUpTime,
      nextFollowUpType,
      nextFollowUpNotes,
      followUpHistory: [
        {
          id: `fu-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'Survey Lokasi',
          notes: notes || 'Pendaftaran prospek awal dari pertemuan pertama.',
          isCompleted: true,
        },
      ],
      notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddProspect(newProspect);
    setShowAddModal(false);
    handleResetForm();
    alert(`Prospek baru "${newProspect.name}" berhasil ditambahkan atas nama user login ${newProspect.agentName}!`);
  };

  const handleAddFollowUpLog = (prospect: ProspectRecord) => {
    if (!newLogNotes.trim()) {
      alert('Isi catatan hasil follow up!');
      return;
    }

    const newFU: ProspectFollowUp = {
      id: `fu-${Date.now()}`,
      date: newLogDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: newLogType,
      notes: newLogNotes.trim(),
      isCompleted: true,
    };

    const updatedHistory = [newFU, ...(prospect.followUpHistory || [])];
    const updatedRecord: ProspectRecord = {
      ...prospect,
      followUpHistory: updatedHistory,
      nextFollowUpDate: newLogNextDate ? newLogNextDate : prospect.nextFollowUpDate,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateProspect(updatedRecord);
    setSelectedProspectDetail(updatedRecord);
    setNewLogNotes('');
    setNewLogNextDate('');
    alert('Catatan follow up / janji baru berhasil disimpan!');
  };

  // Filter prospects
  const userRole = currentUser?.role || 'Sales Marketing';
  const isMarketingRole = userRole === 'Sales Marketing';

  const userProspects = prospects.filter((p) => {
    // If user is Sales Marketing, show their own prospects
    if (isMarketingRole && currentUser?.name) {
      const isMine = p.agentName.toLowerCase().includes(currentUser.name.toLowerCase()) || p.agentId === currentUser.id;
      if (!isMine) return false;
    }

    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.projectNameInterest && p.projectNameInterest.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSource = sourceFilter === 'all' || p.source === sourceFilter;

    return matchSearch && matchStatus && matchSource;
  });

  const getStatusBadge = (st: ProspectStatus) => {
    switch (st) {
      case 'Berminat':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-300">👍 Berminat</span>;
      case 'Cuma Tanya-tanya':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[10px] border border-slate-300">💬 Cuma Tanya</span>;
      case 'Masih Dirundingkan':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] border border-blue-300">🤝 Dirundingkan</span>;
      case 'Minta Nego Harga':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] border border-amber-300">🏷️ Nego Harga</span>;
      case 'Proses KPR / Pemberkasan':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold text-[10px] border border-indigo-300">📋 Berkas KPR</span>;
      case 'Deal / Booking Kavling':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-full font-black text-[10px] border border-purple-300 shadow-sm">🎉 Deal / Booking</span>;
      case 'Batal / Tidak Berminat':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px] border border-rose-300">❌ Batal</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-[10px]">{st}</span>;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-black tracking-wide">Pencatatan Prospek Calon User</h1>
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-full">
              User Logged-In Mode
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Log history & pelaporan prospek marketing atas nama user login: <strong className="text-amber-400">{currentUser?.name || 'User ERP'}</strong> ({currentUser?.role})
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>TAMBAH PROSPEK USER BARU</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Total Prospek Saya</span>
            <span className="text-2xl font-black text-slate-900">{userProspects.length}</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Status Berminat</span>
            <span className="text-2xl font-black text-emerald-600">
              {userProspects.filter((p) => p.status === 'Berminat').length}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Janji Follow Up Hari Ini</span>
            <span className="text-2xl font-black text-indigo-600">
              {userProspects.filter((p) => p.nextFollowUpDate === todayStr).length}
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Deal / Booking Kavling</span>
            <span className="text-2xl font-black text-purple-600">
              {userProspects.filter((p) => p.status === 'Deal / Booking Kavling').length}
            </span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, no hp, proyek..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 mr-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Status Prospek</option>
            <option value="Berminat">Berminat</option>
            <option value="Cuma Tanya-tanya">Cuma Tanya-tanya</option>
            <option value="Masih Dirundingkan">Masih Dirundingkan</option>
            <option value="Minta Nego Harga">Minta Nego Harga</option>
            <option value="Proses KPR / Pemberkasan">Proses KPR / Pemberkasan</option>
            <option value="Deal / Booking Kavling">Deal / Booking Kavling</option>
            <option value="Batal / Tidak Berminat">Batal / Tidak Berminat</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Sumber Prospek</option>
            <option value="Iklan Medsos">Iklan Medsos</option>
            <option value="Visit Lokasi Langsung">Visit Lokasi Langsung</option>
            <option value="Sebar Brosur">Sebar Brosur</option>
            <option value="Referensi">Referensi</option>
          </select>
        </div>
      </div>

      {/* Prospect Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userProspects.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3">
            <UserPlus className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-700">Belum Ada Prospek Ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Silakan klik tombol &quot;Tambah Prospek User Baru&quot; untuk mencatat calon pembeli rumah berserta bukti foto, lokasi GPS & janji follow up.
            </p>
          </div>
        ) : (
          userProspects.map((p) => {
            const isTodayFU = p.nextFollowUpDate === todayStr;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header & Photo */}
                  <div className="relative h-40 bg-slate-900 group overflow-hidden">
                    <img
                      src={p.photoUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex gap-1">
                      {getStatusBadge(p.status)}
                    </div>

                    <button
                      onClick={() => setSelectedPhotoModal(p.photoUrl || null)}
                      className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" /> Foto Pertemuan
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider mb-0.5">
                        Proyek: {p.projectNameInterest || 'Grand Yusuf Residence'}
                      </div>
                      <h3 className="font-black text-base leading-snug">{p.name}</h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3 text-xs text-slate-700">
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium">No. Telepon / WA:</span>
                        <a
                          href={`https://wa.me/62${p.phone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-extrabold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> {p.phone}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium">Sumber Prospek:</span>
                        <span className="font-extrabold text-slate-800">{p.source}</span>
                      </div>
                      {p.source === 'Referensi' && p.sourceReferenceDetail && (
                        <div className="col-span-2 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                          <strong>Detail Referensi:</strong> {p.sourceReferenceDetail}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-medium block">Alamat / Domisili:</span>
                      <p className="font-semibold text-slate-800 line-clamp-1">{p.address}</p>
                    </div>

                    {/* GPS Location badge */}
                    <div className="flex items-center gap-2 p-2 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-slate-800">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">{p.locationName || 'Lokasi Pertemuan'}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{p.locationAddress}</span>
                      </div>
                    </div>

                    {/* Notification / Follow-Up Reminder */}
                    <div className={`p-2.5 rounded-xl border text-[11px] font-medium space-y-1 ${
                      isTodayFU
                        ? 'bg-amber-100 text-amber-950 border-amber-400 animate-pulse'
                        : 'bg-indigo-50/80 text-indigo-950 border-indigo-200'
                    }`}>
                      <div className="flex justify-between items-center font-black">
                        <span className="flex items-center gap-1.5 text-xs text-indigo-900">
                          <Bell className={`w-3.5 h-3.5 ${isTodayFU ? 'text-amber-600' : 'text-indigo-600'}`} />
                          {p.nextFollowUpType || 'Janji Follow Up'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isTodayFU ? 'bg-amber-500 text-slate-950' : 'bg-indigo-200 text-indigo-900'
                        }`}>
                          {p.nextFollowUpDate} {p.nextFollowUpTime || ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-semibold italic">
                        &quot;{p.nextFollowUpNotes || 'Janji follow up dengan konsumen'}&quot;
                      </p>
                    </div>

                    {/* Marketing In Charge */}
                    <div className="flex justify-between items-center text-[10px] pt-1 text-slate-400 border-t border-slate-100">
                      <span>Inputter: <strong className="text-slate-700">{p.agentName}</strong></span>
                      <span>Tanggal: {p.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                  <a
                    href={`https://wa.me/62${p.phone.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(p.name)},%20salam%20dari%20${encodeURIComponent(p.agentName)}%20Developer%20Yusuf%20Property.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>

                  <button
                    onClick={() => setSelectedProspectDetail(p)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" /> Log & Janji
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Tambah Prospek User Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-base">Input Data Prospek Calon User Baru</h3>
                  <p className="text-[11px] text-slate-400">
                    Atas Nama User Login: <strong className="text-amber-300">{currentUser?.name}</strong> ({currentUser?.role})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewProspect} className="p-5 space-y-4 text-xs text-slate-800 max-h-[80vh] overflow-y-auto">
              
              {/* Row 1: Nama & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Nama Calon User / Prospect *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Heru Wibowo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">No. Telepon / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Alamat Calon User</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Melati No. 12, Bintaro, Tangerang Selatan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              {/* Row 2: Sumber Dapat User & Detail Referensi */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-amber-950 block mb-1">Sumber Dapat User *</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as ProspectSource)}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="Iklan Medsos">Iklan Medsos (IG, FB, TikTok, Google)</option>
                      <option value="Visit Lokasi Langsung">Visit Lokasi Langsung (Walk-in)</option>
                      <option value="Sebar Brosur">Sebar Brosur / Canvassing</option>
                      <option value="Referensi">Referensi (Rekomendasi orang lain)</option>
                    </select>
                  </div>

                  {source === 'Referensi' && (
                    <div>
                      <label className="font-bold text-amber-950 block mb-1">Sumber Referensi Dari Mana? *</label>
                      <input
                        type="text"
                        required
                        placeholder="Misal: Ref dari Pak Heru Konsumen Blok A-01"
                        value={sourceReferenceDetail}
                        onChange={(e) => setSourceReferenceDetail(e.target.value)}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-amber-950 block mb-1">Status Prospek Saat Ini *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="Berminat">Berminat</option>
                      <option value="Cuma Tanya-tanya">Cuma Tanya-tanya</option>
                      <option value="Masih Dirundingkan">Masih Dirundingkan</option>
                      <option value="Minta Nego Harga">Minta Nego Harga</option>
                      <option value="Proses KPR / Pemberkasan">Proses KPR / Pemberkasan</option>
                      <option value="Deal / Booking Kavling">Deal / Booking Kavling</option>
                      <option value="Batal / Tidak Berminat">Batal / Tidak Berminat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: Proyek & Tipe Rumah Diminati */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Proyek Yang Diminati *</label>
                  <select
                    value={projectNameInterest}
                    onChange={(e) => setProjectNameInterest(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tipe Rumah / Kaveling</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tipe 36/72 (2 Kamar)"
                    value={preferredUnitType}
                    onChange={(e) => setPreferredUnitType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Share Lokasi GPS & Tempat Pertemuan */}
              <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-amber-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" /> Share Lokasi GPS & Tempat Pertemuan
                  </span>
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={isGettingGps}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg shadow flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    {isGettingGps ? 'Mengambil GPS...' : '📍 Ambil Koordinat GPS Saat Ini'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium block mb-0.5">Nama Tempat / Lokasi Pertemuan:</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-0.5">Alamat GPS / Detail:</label>
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  ✓ Koordinat GPS Terdeteksi: Lat {coordinates.lat}, Lng {coordinates.lng}
                </div>
              </div>

              {/* Bukti Foto Pertemuan / Lokasi */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 block flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-amber-600" /> Bukti Foto Ditemui & Lokasi Pertemuan
                  </label>
                  {photoUrl && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                      ✓ Foto Siap Tersimpan
                    </span>
                  )}
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Live Camera Viewfinder Overlay Container */}
                {isLiveCameraOpen ? (
                  <div className="p-3 bg-slate-950 rounded-2xl border-2 border-amber-500 space-y-3 shadow-xl">
                    <div className="flex justify-between items-center text-white">
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                        <Video className="w-4 h-4 animate-pulse text-rose-500" /> Kamera Live Real-time Aktif
                      </span>
                      <button
                        type="button"
                        onClick={handleStopLiveCamera}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
                      >
                        Matikan Kamera
                      </button>
                    </div>

                    {cameraError ? (
                      <div className="p-3 bg-rose-900/50 border border-rose-700 rounded-xl text-rose-200 text-xs space-y-2">
                        <p>{cameraError}</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px]"
                          >
                            📷 Gunakan Kamera HP Native
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg text-[11px]"
                          >
                            📁 Upload Foto File
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Target Grid Line */}
                        <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none rounded-xl" />
                      </div>
                    )}

                    {!cameraError && (
                      <div className="flex justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCaptureLivePhoto}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4 stroke-[2.5]" />
                          <span>JEPRET FOTO SEKARANG</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Action Buttons */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleStartLiveCamera}
                      className="p-3 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer border border-slate-700"
                    >
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>Kamera Live Real-time</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Kamera HP Native</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload File / Galeri</span>
                    </button>
                  </div>
                )}

                {/* Photo Preview Box if Photo standard/live is selected */}
                {photoUrl && (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={photoUrl}
                        alt="Bukti Foto"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-300 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="font-extrabold text-slate-900 block text-xs truncate">
                          Bukti Foto Terpilih ({photoSourceType === 'camera' ? 'Real-time Camera' : photoSourceType === 'upload' ? 'Upload Perangkat' : 'Preset / URL'})
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {photoUrl.startsWith('data:') ? 'Format: Base64 / File Local Data' : photoUrl}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                )}

                {/* Collapsible / Sample Presets & URL Fallback */}
                <details className="text-[11px] text-slate-600 pt-1">
                  <summary className="font-bold text-slate-700 cursor-pointer hover:text-amber-600 transition-colors">
                    Opsi Lain: Gunakan Contoh Foto Preset / Input URL
                  </summary>
                  <div className="pt-2 space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {samplePhotos.map((ph, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPhotoUrl(ph.url);
                            setPhotoSourceType('preset');
                          }}
                          className={`p-1.5 rounded-xl border text-left transition-all ${
                            photoUrl === ph.url
                              ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-400'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <img src={ph.url} alt={ph.label} className="w-full h-14 object-cover rounded-lg mb-1" />
                          <span className="text-[10px] font-bold text-slate-800 block line-clamp-1">{ph.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">URL Foto Khusus (Web Image URL):</span>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={photoUrl}
                        onChange={(e) => {
                          setPhotoUrl(e.target.value);
                          setPhotoSourceType('url');
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </details>
              </div>

              {/* Janji Ketemuan Lagi / Notifikasi Reminders */}
              <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <span className="font-black text-indigo-950 text-xs">Atur Notifikasi & Janji Follow Up (Janji Ketemuan Lagi / Telpon)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-indigo-900 block mb-0.5">Tanggal Janji *</label>
                    <input
                      type="date"
                      required
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-indigo-900 block mb-0.5">Jam Janji</label>
                    <input
                      type="time"
                      value={nextFollowUpTime}
                      onChange={(e) => setNextFollowUpTime(e.target.value)}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-indigo-900 block mb-0.5">Jenis Follow Up</label>
                    <select
                      value={nextFollowUpType}
                      onChange={(e) => setNextFollowUpType(e.target.value as any)}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="Janji Ketemuan Lagi">Janji Ketemuan Lagi</option>
                      <option value="Telepon / WA Follow Up">Telepon / WA Follow Up</option>
                      <option value="Survey Lokasi">Survey Lokasi</option>
                      <option value="Negosiasi Harga">Negosiasi Harga</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-indigo-900 block mb-0.5">Catatan Pengingat Janji Follow Up</label>
                  <input
                    type="text"
                    placeholder="Misal: Janji temu di Marketing Gallery jam 10 pagi untuk tentukan blok"
                    value={nextFollowUpNotes}
                    onChange={(e) => setNextFollowUpNotes(e.target.value)}
                    className="w-full p-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Catatan Diskusi */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Catatan Hasil Diskusi Pertemuan Pertama</label>
                <textarea
                  rows={2}
                  placeholder="Isi rangkuman kebutuhan konsumen, skema KPR / Cash, tanggapan harga..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 stroke-[3]" />
                  <span>SIMPAN PROSPEK USER</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log History & Follow Up Detail */}
      {selectedProspectDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-base">History Prospek & Janji Follow Up</h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  Konsumen: <strong className="text-amber-300">{selectedProspectDetail.name}</strong> ({selectedProspectDetail.phone})
                </p>
              </div>
              <button
                onClick={() => setSelectedProspectDetail(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800 max-h-[80vh] overflow-y-auto">
              
              {/* Profile Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Marketing In Charge:</span>
                  <span className="font-black text-slate-900">{selectedProspectDetail.agentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Status Prospek:</span>
                  <div>{getStatusBadge(selectedProspectDetail.status)}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Sumber Prospek:</span>
                  <span className="font-extrabold text-slate-800">{selectedProspectDetail.source}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Proyek Diminati:</span>
                  <span className="font-extrabold text-amber-600">{selectedProspectDetail.projectNameInterest}</span>
                </div>
              </div>

              {/* Add New Follow-Up Form */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
                <h4 className="font-black text-amber-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" /> Input Log / Hasil Follow Up Terbaru
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-amber-900 block mb-0.5">Tgl Follow Up</label>
                    <input
                      type="date"
                      value={newLogDate}
                      onChange={(e) => setNewLogDate(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-amber-900 block mb-0.5">Jenis Follow Up</label>
                    <select
                      value={newLogType}
                      onChange={(e) => setNewLogType(e.target.value as any)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="Janji Ketemuan Lagi">Janji Ketemuan Lagi</option>
                      <option value="Telepon / WA Follow Up">Telepon / WA Follow Up</option>
                      <option value="Survey Lokasi">Survey Lokasi</option>
                      <option value="Negosiasi Harga">Negosiasi Harga</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-amber-900 block mb-0.5">Catatan Hasil Follow Up *</label>
                  <input
                    type="text"
                    placeholder="Misal: Konsumen setuju booking kaveling pekan depan setelah gaji cair"
                    value={newLogNotes}
                    onChange={(e) => setNewLogNotes(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-900 block mb-0.5">Janji Follow Up Berikutnya (Opsional)</label>
                  <input
                    type="date"
                    value={newLogNextDate}
                    onChange={(e) => setNewLogNextDate(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAddFollowUpLog(selectedProspectDetail)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Simpan Log Follow Up
                  </button>
                </div>
              </div>

              {/* Timeline History Logs */}
              <div className="space-y-2 pt-2">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-600" /> Timeline History Aktivitas Prospek
                </h4>

                {(!selectedProspectDetail.followUpHistory || selectedProspectDetail.followUpHistory.length === 0) ? (
                  <p className="text-slate-400 text-center py-4 italic">Belum ada riwayat follow up tercatat.</p>
                ) : (
                  <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                    {selectedProspectDetail.followUpHistory.map((fu) => (
                      <div key={fu.id} className="relative bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="absolute -left-[23px] top-3.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white" />
                        <div className="flex justify-between items-center">
                          <span className="font-black text-slate-900 text-xs">{fu.type}</span>
                          <span className="text-[10px] font-bold text-slate-500">{fu.date} {fu.time || ''}</span>
                        </div>
                        <p className="text-slate-700 font-medium">{fu.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 bg-slate-950 text-white font-bold text-sm border-b border-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" /> Bukti Foto Ditemui & Lokasi Pertemuan
            </div>
            <div className="p-4 flex items-center justify-center bg-black">
              <img src={selectedPhotoModal} alt="Bukti Foto Pertemuan" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
