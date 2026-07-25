import React, { useState } from 'react';
import { AttendanceRecord, AttendanceType, AppUser, HousingProject } from '../types';
import {
  Clock,
  MapPin,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Trash2,
  Compass,
  ExternalLink,
  Briefcase,
  Moon,
  Sun,
  ShieldAlert,
  Award,
  Layers,
  Building2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

interface AttendanceManagerProps {
  attendanceRecords: AttendanceRecord[];
  users: AppUser[];
  projects: HousingProject[];
  currentUser?: AppUser | null;
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (id: string) => void;
}

// Preset Locations
const PRESET_LOCATIONS = [
  { name: 'Kantor Pusat Developer Yusuf Property', address: 'Jl. Merdeka Utama No. 88, Jakarta Pusat', lat: -6.2088, lng: 106.8456 },
  { name: 'Grand Yusuf Residence (Proyek A)', address: 'Galeri Pemasaran & Site Office Grand Yusuf', lat: -6.2891, lng: 106.8251 },
  { name: 'Cluster Royal Yusuf (Proyek B)', address: 'Pos Satpam & Pemasaran Cluster Royal', lat: -6.3012, lng: 106.7821 },
  { name: 'Lokasi Lapangan / Luar Office', address: 'Survey / Kunjungan Proyek Luar', lat: -6.2100, lng: 106.8500 },
];

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  attendanceRecords,
  users,
  projects,
  currentUser,
  onAddAttendance,
  onUpdateAttendance,
  onDeleteAttendance,
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterEmployee, setFilterEmployee] = useState<string>('all');

  // Modal Absen State
  const [showModal, setShowModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Form State
  const [selectedUser, setSelectedUser] = useState<string>(currentUser?.id || users[0]?.id || '');
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('Absen Masuk');
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [clockInTime, setClockInTime] = useState<string>('08:00');
  const [clockOutTime, setClockOutTime] = useState<string>('17:00');
  
  // Location States
  const [locationName, setLocationName] = useState<string>(PRESET_LOCATIONS[0].name);
  const [locationAddress, setLocationAddress] = useState<string>(PRESET_LOCATIONS[0].address);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>({
    lat: PRESET_LOCATIONS[0].lat,
    lng: PRESET_LOCATIONS[0].lng,
  });
  const [notes, setNotes] = useState<string>('');

  // Get Current Time String formatted HH:mm
  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper to calculate duration in minutes between HH:mm and HH:mm
  const calculateWorkDuration = (inTimeStr: string, outTimeStr: string) => {
    if (!inTimeStr || !outTimeStr) return { minutes: 0, formatted: '0 Jam 0 Menit' };

    const [inH, inM] = inTimeStr.split(':').map(Number);
    const [outH, outM] = outTimeStr.split(':').map(Number);

    let inTotalMinutes = inH * 60 + inM;
    let outTotalMinutes = outH * 60 + outM;

    // Handle shift crossing midnight if applicable
    if (outTotalMinutes < inTotalMinutes) {
      outTotalMinutes += 24 * 60;
    }

    const diffMinutes = outTotalMinutes - inTotalMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return {
      minutes: diffMinutes,
      formatted: `${hours} Jam ${minutes} Menit`,
    };
  };

  // Geolocation Handler
  const handleGetGPSLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung akses GPS Geolocation.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        const accuracy = Math.round(position.coords.accuracy);

        setCoords({ lat: latitude, lng: longitude });
        setLocationName('Lokasi Terdeteksi GPS Karyawan');
        setLocationAddress(`Koordinat: ${latitude}, ${longitude} (Akurasi: ${accuracy} meter)`);
        setIsGettingLocation(false);
      },
      (error) => {
        let msg = 'Gagal mengambil koordinat lokasi.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin lokasi ditolak oleh browser. Silakan izinkan akses lokasi pada browser Anda.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Sinyal lokasi tidak tersedia.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Waktu pengambilan lokasi habis.';
        }
        setLocationError(msg);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Preset Location Selection
  const handleSelectPresetLocation = (presetName: string) => {
    const preset = PRESET_LOCATIONS.find((p) => p.name === presetName);
    if (preset) {
      setLocationName(preset.name);
      setLocationAddress(preset.address);
      setCoords({ lat: preset.lat, lng: preset.lng });
    } else {
      setLocationName(presetName);
    }
  };

  // Reset Modal Form
  const resetForm = () => {
    setSelectedUser(currentUser?.id || users[0]?.id || '');
    setAttendanceType('Absen Masuk');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setClockInTime(getCurrentTimeString());
    setClockOutTime('17:00');
    setLocationName(PRESET_LOCATIONS[0].name);
    setLocationAddress(PRESET_LOCATIONS[0].address);
    setCoords({ lat: PRESET_LOCATIONS[0].lat, lng: PRESET_LOCATIONS[0].lng });
    setNotes('');
    setLocationError(null);
  };

  // Handle Open Modal
  const handleOpenAddModal = (type: AttendanceType = 'Absen Masuk') => {
    resetForm();
    setAttendanceType(type);
    setClockInTime(getCurrentTimeString());
    if (type === 'Absen Pulang') {
      setClockOutTime(getCurrentTimeString());
      // Check if employee clocked in today
      const employeeObj = users.find((u) => u.id === (currentUser?.id || selectedUser));
      if (employeeObj) {
        const todayInRecord = attendanceRecords.find(
          (r) => r.employeeName === employeeObj.name && r.date === new Date().toISOString().split('T')[0] && r.clockInTime
        );
        if (todayInRecord) {
          setClockInTime(todayInRecord.clockInTime.slice(0, 5));
          if (todayInRecord.locationName) setLocationName(todayInRecord.locationName);
        }
      }
    }
    setShowModal(true);
  };

  // Submit Absensi
  const handleSubmitAbsensi = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = users.find((u) => u.id === selectedUser) || currentUser || users[0];
    if (!targetEmp) return;

    let durationData = { minutes: 0, formatted: '-' };
    let finalClockOut = clockOutTime;

    if (attendanceType === 'Absen Pulang' || attendanceType === 'Lembur (Tgl Merah)') {
      durationData = calculateWorkDuration(clockInTime, clockOutTime);
    } else {
      finalClockOut = undefined as unknown as string;
    }

    // Check if updating existing record for Absen Pulang on same date
    const existingInRecord = attendanceRecords.find(
      (r) => r.employeeId === targetEmp.id && r.date === recordDate
    );

    if (attendanceType === 'Absen Pulang' && existingInRecord) {
      // Update existing Absen Masuk record to include Absen Pulang & calculated hours
      const calculated = calculateWorkDuration(existingInRecord.clockInTime.slice(0, 5), clockOutTime);
      const updatedRecord: AttendanceRecord = {
        ...existingInRecord,
        attendanceType: 'Absen Pulang',
        clockOutTime: `${clockOutTime}:00`,
        locationName: locationName || existingInRecord.locationName,
        locationAddress: locationAddress || existingInRecord.locationAddress,
        coordinates: coords || existingInRecord.coordinates,
        workDurationMinutes: calculated.minutes,
        workDurationFormatted: calculated.formatted,
        notes: notes ? `${existingInRecord.notes || ''} | Absen Pulang: ${notes}` : existingInRecord.notes,
      };
      onUpdateAttendance(updatedRecord);
    } else {
      // Create New Record
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: targetEmp.id,
        employeeName: targetEmp.name,
        employeeRole: targetEmp.role,
        date: recordDate,
        attendanceType: attendanceType,
        clockInTime: `${clockInTime}:00`,
        clockOutTime: (attendanceType === 'Absen Pulang' || attendanceType === 'Lembur (Tgl Merah)') ? `${clockOutTime}:00` : undefined,
        locationName: locationName || 'Kantor Pusat Yusuf Property',
        locationAddress: locationAddress || 'Lokasi Terdaftar Sistem',
        coordinates: coords,
        workDurationMinutes: (attendanceType === 'Absen Pulang' || attendanceType === 'Lembur (Tgl Merah)') ? durationData.minutes : undefined,
        workDurationFormatted: (attendanceType === 'Absen Pulang' || attendanceType === 'Lembur (Tgl Merah)') ? durationData.formatted : undefined,
        isOvertimeHoliday: attendanceType === 'Lembur (Tgl Merah)',
        notes: notes,
        createdAt: new Date().toISOString(),
      };
      onAddAttendance(newRecord);
    }

    setShowModal(false);
    resetForm();
  };

  // Filtered Records
  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchSearch =
      rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.notes && rec.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = filterType === 'all' || rec.attendanceType === filterType;
    const matchEmp = filterEmployee === 'all' || rec.employeeId === filterEmployee;

    let matchDate = true;
    const todayStr = new Date().toISOString().split('T')[0];
    if (filterDate === 'today') {
      matchDate = rec.date === todayStr;
    } else if (filterDate === 'month') {
      matchDate = rec.date.slice(0, 7) === todayStr.slice(0, 7);
    }

    return matchSearch && matchType && matchEmp && matchDate;
  });

  // Calculate Summary Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceCount = attendanceRecords.filter((r) => r.date === todayStr).length;
  const todayLemburCount = attendanceRecords.filter((r) => r.date === todayStr && r.isOvertimeHoliday).length;
  
  const totalDurationMinutesAll = attendanceRecords.reduce((acc, r) => acc + (r.workDurationMinutes || 0), 0);
  const totalHoursAll = Math.floor(totalDurationMinutesAll / 60);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Main Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Sistem Absensi Karyawan & Pelacakan Lokasi GPS
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Absen masuk, absen pulang, lembur tanggal merah, otomatis merekam koordinat GPS lokasi & menghitung lama jam kerja.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenAddModal('Absen Masuk')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all"
          >
            <Sun className="w-4 h-4" />
            <span>Absen Masuk</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('Absen Pulang')}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all"
          >
            <Moon className="w-4 h-4" />
            <span>Absen Pulang</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('Lembur (Tgl Merah)')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Lembur (Tgl Merah)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Absensi Hari Ini</p>
            <h3 className="text-2xl font-black text-slate-900">{todayAttendanceCount} Karyawan</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Lembur Tanggal Merah Hari Ini</p>
            <h3 className="text-2xl font-black text-amber-700">{todayLemburCount} Record</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Total Akumulasi Jam Kerja</p>
            <h3 className="text-2xl font-black text-blue-700">{totalHoursAll} Jam</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Akurasi GPS & Geolocation</p>
            <h3 className="text-sm font-black text-purple-900">Aktif & Auto Record</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari karyawan, lokasi, atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Filter Type */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-500">Tipe Absen:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Tipe</option>
              <option value="Absen Masuk">Absen Masuk</option>
              <option value="Absen Pulang">Absen Pulang</option>
              <option value="Lembur (Tgl Merah)">Lembur (Tgl Merah)</option>
            </select>
          </div>

          {/* Filter Date */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-500">Waktu:</span>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>

          {/* Filter Employee */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-500">Karyawan:</span>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Karyawan</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Riwayat Rekam Absensi, Lokasi GPS & Jam Kerja Karyawan</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Menampilkan log keberadaan karyawan, koordinat GPS saat absen, serta kalkulasi otomatis durasi jam kerja.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Nama Karyawan & Jabatan</th>
                <th className="p-3.5">Tipe Absensi</th>
                <th className="p-3.5">Jam Masuk</th>
                <th className="p-3.5">Jam Pulang</th>
                <th className="p-3.5">Lama Bekerja (Durasi)</th>
                <th className="p-3.5">Update Lokasi Karyawan (GPS)</th>
                <th className="p-3.5">Catatan / Keterangan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Belum ada riwayat absensi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isPulang = rec.attendanceType === 'Absen Pulang';
                  const isLembur = rec.attendanceType === 'Lembur (Tgl Merah)';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">{rec.date}</td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 text-xs">{rec.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{rec.employeeRole}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-black text-[11px] inline-flex items-center gap-1 ${
                            isLembur
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isPulang
                              ? 'bg-sky-100 text-sky-900 border border-sky-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {isLembur && <Zap className="w-3 h-3 text-amber-600" />}
                          {isPulang && <Moon className="w-3 h-3 text-sky-600" />}
                          {!isLembur && !isPulang && <Sun className="w-3 h-3 text-emerald-600" />}
                          <span>{rec.attendanceType}</span>
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{rec.clockInTime || '-'}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{rec.clockOutTime || '-'}</td>
                      <td className="p-3.5">
                        {rec.workDurationFormatted ? (
                          <span className="px-2.5 py-1 bg-slate-900 text-amber-400 font-extrabold rounded-lg text-xs border border-slate-800 inline-block">
                            {rec.workDurationFormatted}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Sedang Bekerja...</span>
                        )}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-center gap-1 text-slate-900 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="truncate">{rec.locationName}</span>
                        </div>
                        {rec.locationAddress && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{rec.locationAddress}</div>
                        )}
                        {rec.coordinates && (
                          <a
                            href={`https://www.google.com/maps?q=${rec.coordinates.lat},${rec.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline mt-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Buka Google Maps ({rec.coordinates.lat}, {rec.coordinates.lng})
                          </a>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{rec.notes || '-'}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan absensi karyawan ${rec.employeeName}?`)) {
                              onDeleteAttendance(rec.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus Record"
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

      {/* MODAL ABSENSI & LOKASI GPS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 px-5 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  Form Absensi Karyawan - {attendanceType}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAbsensi} className="p-5 space-y-4 text-xs">
              
              {/* Select Employee */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Karyawan *</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.role} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance Type Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilihan Sesi Absensi *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendanceType('Absen Masuk')}
                    className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      attendanceType === 'Absen Masuk'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Masuk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendanceType('Absen Pulang')}
                    className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      attendanceType === 'Absen Pulang'
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Pulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendanceType('Lembur (Tgl Merah)')}
                    className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      attendanceType === 'Lembur (Tgl Merah)'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Lembur</span>
                  </button>
                </div>
              </div>

              {/* Date & Time Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Absensi *</label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {attendanceType === 'Absen Pulang' ? 'Jam Absen Masuk' : 'Jam Masuk Kerja *'}
                  </label>
                  <input
                    type="time"
                    value={clockInTime}
                    onChange={(e) => setClockInTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Clock Out Time for Absen Pulang or Lembur */}
              {(attendanceType === 'Absen Pulang' || attendanceType === 'Lembur (Tgl Merah)') && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-amber-950 block">Jam Absen Pulang *</label>
                    <span className="text-[10px] text-amber-800 font-bold">Kalkulasi Otomatis Jam Kerja</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={clockOutTime}
                      onChange={(e) => setClockOutTime(e.target.value)}
                      className="w-36 p-2.5 bg-white border border-amber-300 rounded-xl font-mono font-black text-amber-950 text-sm focus:outline-none"
                    />
                    <div className="flex-1 bg-amber-100 p-2.5 rounded-xl text-center border border-amber-300">
                      <span className="text-[10px] font-bold text-amber-800 block">Lama Bekerja:</span>
                      <span className="font-black text-amber-950 text-sm">
                        {calculateWorkDuration(clockInTime, clockOutTime).formatted}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Geolocation & Location Choice */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>Lokasi Karyawan Saat Absen *</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleGetGPSLocation}
                    disabled={isGettingLocation}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold rounded-xl text-[11px] flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Compass className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                    <span>{isGettingLocation ? 'Mendeteksi GPS...' : 'Dapatkan Lokasi GPS Saya'}</span>
                  </button>
                </div>

                {locationError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{locationError}</span>
                  </div>
                )}

                {/* Preset Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Pilih Lokasi Kantor / Proyek:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_LOCATIONS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectPresetLocation(preset.name)}
                        className={`p-2 rounded-xl text-left font-bold text-[11px] border transition-all ${
                          locationName === preset.name
                            ? 'bg-amber-50 border-amber-400 text-amber-950 font-extrabold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Name & Address Display */}
                <div>
                  <input
                    type="text"
                    placeholder="Nama Lokasi (misal: Kantor Pusat, Proyek A)"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                {coords && (
                  <div className="p-2 bg-slate-100 rounded-xl font-mono text-[10px] text-slate-600 flex items-center justify-between">
                    <span>Koordinat Terdeteksi: {coords.lat}, {coords.lng}</span>
                    <a
                      href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Buka Maps ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Keterangan Tugas</label>
                <textarea
                  rows={2}
                  placeholder="misal: Piketing Pemasaran, Survey Konsumen, Audit Laporan Keuangan"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Record Absensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
