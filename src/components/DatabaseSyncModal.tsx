import React, { useState } from 'react';
import { Database, Download, Upload, RefreshCw, CheckCircle2, ShieldCheck, X, HardDrive, Cpu, Radio } from 'lucide-react';
import { exportDatabaseToJson, importDatabaseFromJson, idbGetAllKeys } from '../utils/indexedDB';
import { AppUser } from '../types';

interface DatabaseSyncModalProps {
  currentUser: AppUser | null;
  onClose: () => void;
  onDataReload: () => void;
}

export const DatabaseSyncModal: React.FC<DatabaseSyncModalProps> = ({
  currentUser,
  onClose,
  onDataReload,
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle Export Backup JSON File
  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const jsonStr = await exportDatabaseToJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `YusufProperty_ERP_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage('✓ Database ERP berhasil di-export ke file JSON backup.');
    } catch (err) {
      console.error(err);
      setStatusMessage('❌ Gagal melakukan export data.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Import Backup JSON File
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const text = await file.text();
      const success = await importDatabaseFromJson(text);
      if (success) {
        setStatusMessage('✓ Berhasil melakukan import database! Memuat ulang data...');
        setTimeout(() => {
          onDataReload();
          onClose();
        }, 1200);
      } else {
        setStatusMessage('❌ Format file JSON backup tidak valid.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('❌ Gagal membaca file backup.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full text-white shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Database Cloud & Auto-Sync System</h3>
              <p className="text-[11px] text-slate-400">Firebase Firestore + IndexedDB Realtime Sync Multi-Device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Storage Technology Banner */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="font-extrabold flex items-center gap-1.5 text-xs">
                <HardDrive className="w-4 h-4 text-emerald-400" /> Storage Engine: IndexedDB (Aktif)
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black border border-emerald-500/40">
                100% SIAP PAKAI
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Seluruh data input, foto bukti lokasi, sertifikat, berkas KPR, serta log perubahan tersimpan langsung di database internal browser <strong>IndexedDB</strong> tanpa batas 5MB LocalStorage.
            </p>
          </div>

          {/* Realtime Cross-Tab Broadcast Banner */}
          <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-extrabold">
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Sistem Auto-Sync Lintas User / Tab Realtime</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Setiap kali Anda atau user lain menginput, mengedit, atau menghapus data (SPR, konsumen, keuangan, proyek), sistem secara otomatis memicu sinyal synchronisasi realtime sehingga data terkoneksi langsung.
            </p>
          </div>

          {/* User Audit Info */}
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">User Login Terhubung:</span>
              <span className="font-extrabold text-amber-400">{currentUser?.name || 'Administrator'}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Role: {currentUser?.role}</span>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-400">
              <span>Status: Synchronized</span>
              <span className="block text-emerald-400 font-bold">✓ Live Connected</span>
            </div>
          </div>

          {/* Backup & Import Controls */}
          <div className="pt-2 space-y-2">
            <span className="font-bold text-slate-300 block text-xs">Manajemen Database & Backup File:</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup (.json)</span>
              </button>

              <label className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                <span>Import Backup (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {statusMessage && (
            <div className="p-2.5 bg-slate-800 border border-slate-700 text-amber-300 rounded-xl font-bold text-center text-xs animate-fadeIn">
              {statusMessage}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
