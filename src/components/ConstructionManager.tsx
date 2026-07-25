import React, { useState } from 'react';
import { ConstructionMilestone } from '../types';
import { formatRupiah } from '../utils/formatters';
import { HardHat, CheckCircle2, Clock, AlertTriangle, Plus, HardDrive, DollarSign, Calendar, Edit3 } from 'lucide-react';

interface ConstructionManagerProps {
  construction: ConstructionMilestone[];
  onUpdateProgress: (id: string, newProgress: number) => void;
}

export const ConstructionManager: React.FC<ConstructionManagerProps> = ({
  construction,
  onUpdateProgress,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <HardHat className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Manajemen Konstruksi & SPK Subkontraktor</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring fisik pembangunan unit rumah, SPK Mandor, RAB Anggaran, dan Kurva Progres Lapangan Yusuf Property.
          </p>
        </div>
      </div>

      {/* Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {construction.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:border-amber-400 transition-all"
            >
              {/* Unit Code & Contractor */}
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

              {/* Stage Name */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <span className="text-slate-500 font-medium">Tahap Pekerjaan Saat Ini:</span>
                <div className="font-bold text-slate-900 text-sm">{item.stageName}</div>
                <div className="text-slate-500 flex items-center gap-1 text-[11px] pt-1">
                  <Calendar className="w-3 h-3 text-amber-600" /> Target Selesai: {item.targetCompletionDate}
                </div>
              </div>

              {/* Progress Slider */}
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
                          setEditingId(item.id);
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
                          setEditingId(null);
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
                    className="w-full accent-amber-500"
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

              {/* RAB Budget Allocation */}
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
        })}
      </div>

    </div>
  );
};
