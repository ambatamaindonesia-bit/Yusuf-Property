import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Maximize2, RotateCcw } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  isActive: boolean;
  onToggleActive: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  isActive,
  onToggleActive,
}) => {
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'samsung' | 'pixel'>('iphone');

  if (!isActive) {
    return <>{children}</>;
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-2 flex flex-col items-center justify-center animate-fadeIn">
      {/* Top Floating Mobile View Controls Bar */}
      <div className="w-full max-w-md mb-4 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-white shadow-xl z-50">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold text-xs text-amber-300">Mode Tampilan HP Simulator</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Model Selector */}
          <select
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="iphone">iPhone 15 Pro</option>
            <option value="samsung">Galaxy S24 Ultra</option>
            <option value="pixel">Google Pixel 8</option>
          </select>

          {/* Switch Back to Desktop Button */}
          <button
            type="button"
            onClick={onToggleActive}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Tampilan Desktop</span>
          </button>
        </div>
      </div>

      {/* Smartphone Hardware Frame Chassis */}
      <div className="relative w-full max-w-[420px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50">
        
        {/* Hardware Notch / Camera Punch Hole */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          {deviceModel === 'iphone' ? (
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2">
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800" />
          )}
        </div>

        {/* Inner Phone Screen Canvas Container */}
        <div className="relative bg-slate-950 rounded-[38px] overflow-hidden border border-slate-800 h-[812px] flex flex-col custom-scrollbar">
          
          {/* Smartphone Top Status Bar */}
          <div className="pt-2 px-6 pb-1 bg-slate-900 text-slate-300 text-[10px] font-semibold flex items-center justify-between border-b border-slate-800/60 shrink-0 z-40">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <Battery className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          {/* Screen Content Wrapper */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {children}
          </div>

          {/* Smartphone Bottom Gesture Bar */}
          <div className="py-1.5 bg-slate-900 flex justify-center shrink-0 z-40 border-t border-slate-800/40">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>

        </div>

        {/* Side Buttons Visual Accents */}
        <div className="absolute -left-1.5 top-28 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-1.5 top-44 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-1.5 top-36 w-1 h-16 bg-slate-700 rounded-r-sm" />
      </div>

    </div>
  );
};
