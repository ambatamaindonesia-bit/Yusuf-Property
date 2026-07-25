import React, { useState } from 'react';
import {
  calculateKprMonthly,
  calculateRemainingPrincipal,
  formatRupiah,
} from '../utils/formatters';
import {
  Calculator,
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Info,
  Scale,
  Sparkles,
  ArrowRight,
  BadgePercent,
  Coins,
} from 'lucide-react';

export type KprSchemeType = 'bank_flat_floating' | 'bunga_berjenjang' | 'kpr_syariah';

export const KprCalculator: React.FC = () => {
  const [scheme, setScheme] = useState<KprSchemeType>('bank_flat_floating');

  // Parameter Umum
  const [housePrice, setHousePrice] = useState<number>(450000000);
  const [dpPercent, setDpPercent] = useState<number>(10); // 10%
  const [tenorYears, setTenorYears] = useState<number>(15);

  // Skema 1: Bank Umum (Flat Fixed X Tahun -> Floating)
  const [fixedYears, setFixedYears] = useState<number>(3); // 3 tahun flat
  const [fixedRate, setFixedRate] = useState<number>(4.75); // 4.75%
  const [floatingRate, setFloatingRate] = useState<number>(11.5); // 11.5%

  // Skema 2: Bunga Berjenjang (Step-Up Rate)
  const [tier1Years, setTier1Years] = useState<number>(3); // Thn 1-3
  const [tier1Rate, setTier1Rate] = useState<number>(3.99);
  const [tier2Years, setTier2Years] = useState<number>(3); // Thn 4-6
  const [tier2Rate, setTier2Rate] = useState<number>(6.99);
  const [tier3Rate, setTier3Rate] = useState<number>(10.5); // Thn 7 - dst

  // Skema 3: KPR Syariah (Flat Margin Murabahah)
  const [syariahMarginFlat, setSyariahMarginFlat] = useState<number>(5.5); // 5.5% flat / thn

  // Hitung Nilai Dasar
  const dpAmount = Math.round((housePrice * dpPercent) / 100);
  const loanAmount = Math.max(0, housePrice - dpAmount);

  // --- HITUNG SKEMA 1: Bank Umum (Flat Fixed -> Floating) ---
  const actualFixedYears = Math.min(fixedYears, tenorYears);
  const monthlyFixed = calculateKprMonthly(loanAmount, fixedRate, tenorYears);
  const remainingPrincipalAfterFixed = calculateRemainingPrincipal(
    loanAmount,
    fixedRate,
    tenorYears,
    actualFixedYears
  );
  const remainingTenorYearsFixed = Math.max(1, tenorYears - actualFixedYears);
  const monthlyFloating = calculateKprMonthly(
    remainingPrincipalAfterFixed,
    floatingRate,
    remainingTenorYearsFixed
  );

  // --- HITUNG SKEMA 2: Bunga Berjenjang ---
  // Tier 1
  const actualTier1Years = Math.min(tier1Years, tenorYears);
  const monthlyTier1 = calculateKprMonthly(loanAmount, tier1Rate, tenorYears);
  const remainingPrincipalTier1 = calculateRemainingPrincipal(
    loanAmount,
    tier1Rate,
    tenorYears,
    actualTier1Years
  );

  // Tier 2
  const remainingTenorAfterTier1 = Math.max(0, tenorYears - actualTier1Years);
  const actualTier2Years = Math.min(tier2Years, remainingTenorAfterTier1);
  const monthlyTier2 =
    remainingTenorAfterTier1 > 0 && actualTier2Years > 0
      ? calculateKprMonthly(remainingPrincipalTier1, tier2Rate, remainingTenorAfterTier1)
      : 0;
  const remainingPrincipalTier2 =
    remainingTenorAfterTier1 > 0 && actualTier2Years > 0
      ? calculateRemainingPrincipal(
          remainingPrincipalTier1,
          tier2Rate,
          remainingTenorAfterTier1,
          actualTier2Years
        )
      : remainingPrincipalTier1;

  // Tier 3
  const remainingTenorAfterTier2 = Math.max(0, remainingTenorAfterTier1 - actualTier2Years);
  const monthlyTier3 =
    remainingTenorAfterTier2 > 0
      ? calculateKprMonthly(remainingPrincipalTier2, tier3Rate, remainingTenorAfterTier2)
      : 0;

  // --- HITUNG SKEMA 3: KPR Syariah (Akad Murabahah Flat) ---
  const totalSyariahMargin = Math.round(loanAmount * (syariahMarginFlat / 100) * tenorYears);
  const totalSyariahPrice = loanAmount + totalSyariahMargin;
  const monthlySyariah = Math.round(totalSyariahPrice / (tenorYears * 12));

  // Tentukan Angsuran Utama yang Dipakai untuk Estimasi Syarat Gaji
  let currentMainMonthly = monthlyFixed;
  if (scheme === 'bunga_berjenjang') {
    currentMainMonthly = monthlyTier1;
  } else if (scheme === 'kpr_syariah') {
    currentMainMonthly = monthlySyariah;
  }

  const minRequiredIncome = Math.round(currentMainMonthly * 2.8);

  // Estimasi Biaya Awal Akad KPR
  const bphtbPajak = Math.max(0, Math.round((housePrice - 60000000) * 0.05));
  const biayaNotaris = Math.round(housePrice * 0.012);
  const provisiBank = scheme === 'kpr_syariah' ? 0 : Math.round(loanAmount * 0.01);
  const asuransiEst = Math.round(loanAmount * 0.015);
  const totalBiayaAwalEst = dpAmount + bphtbPajak + biayaNotaris + provisiBank + asuransiEst;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl font-extrabold">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Kalkulator KPR Multi-Skema & Simulasi Angsuran
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulasi pembiayaan KPR Bank Umum (Fixed-Floating), Bunga Berjenjang, serta KPR Syariah (Akad Murabahah).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Pilihan 3 Skema KPR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tab 1: Bank Umum Flat Floating */}
        <button
          onClick={() => setScheme('bank_flat_floating')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            scheme === 'bank_flat_floating'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-xl ${scheme === 'bank_flat_floating' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-700'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            {scheme === 'bank_flat_floating' && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full uppercase">
                Aktif
              </span>
            )}
          </div>
          <div className="font-extrabold text-sm">Bank Umum (Fixed → Floating)</div>
          <div className={`text-[11px] mt-1 ${scheme === 'bank_flat_floating' ? 'text-slate-300' : 'text-slate-500'}`}>
            Bunga promo flat {fixedYears} thn, lalu floating sesuai suku bunga pasar bank.
          </div>
        </button>

        {/* Tab 2: Bunga Berjenjang */}
        <button
          onClick={() => setScheme('bunga_berjenjang')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            scheme === 'bunga_berjenjang'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-xl ${scheme === 'bunga_berjenjang' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-700'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            {scheme === 'bunga_berjenjang' && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full uppercase">
                Aktif
              </span>
            )}
          </div>
          <div className="font-extrabold text-sm">Bunga Berjenjang (Step-Up)</div>
          <div className={`text-[11px] mt-1 ${scheme === 'bunga_berjenjang' ? 'text-slate-300' : 'text-slate-500'}`}>
            Suku bunga naik secara bertahap per 3 tahunan secara transparan.
          </div>
        </button>

        {/* Tab 3: KPR Syariah */}
        <button
          onClick={() => setScheme('kpr_syariah')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            scheme === 'kpr_syariah'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-xl ${scheme === 'kpr_syariah' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-700'}`}>
              <Scale className="w-5 h-5" />
            </div>
            {scheme === 'kpr_syariah' && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full uppercase">
                Aktif
              </span>
            )}
          </div>
          <div className="font-extrabold text-sm">KPR Syariah (Akad Murabahah)</div>
          <div className={`text-[11px] mt-1 ${scheme === 'kpr_syariah' ? 'text-slate-300' : 'text-slate-500'}`}>
            Margin fixed flat & angsuran pasti sampai lunas. Bebas denda & floating.
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls Left Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Parameter Utang & Harga Rumah
            </h3>
            <span className="text-xs text-amber-600 font-extrabold">
              {scheme === 'bank_flat_floating'
                ? 'Bank Umum Flat - Floating'
                : scheme === 'bunga_berjenjang'
                ? 'Skema Step-Up Rate'
                : 'Skema Syariah Flat Margin'}
            </span>
          </div>

          {/* Harga Rumah */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Harga Unit Rumah (Rp)</span>
              <span className="text-amber-600 font-extrabold">{formatRupiah(housePrice)}</span>
            </label>
            <input
              type="number"
              value={housePrice}
              onChange={(e) => setHousePrice(Number(e.target.value) || 0)}
              step={5000000}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[385000000, 450000000, 520000000, 680000000, 1150000000].map((p) => (
                <button
                  key={p}
                  onClick={() => setHousePrice(p)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                >
                  {(p / 1000000).toFixed(0)} Jt
                </button>
              ))}
            </div>
          </div>

          {/* DP Percent Slider & Tenor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Uang Muka / DP ({dpPercent}%)</span>
                <span className="text-emerald-700">{formatRupiah(dpAmount)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={dpPercent}
                onChange={(e) => setDpPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer mt-2"
              />
              <div className="text-[10px] text-slate-400">
                Plafon KPR: <strong className="text-slate-800">{formatRupiah(loanAmount)}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Jangka Waktu Pembiayaan (Tenor)
              </label>
              <select
                value={tenorYears}
                onChange={(e) => setTenorYears(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value={5}>5 Tahun (60 Bulan)</option>
                <option value={10}>10 Tahun (120 Bulan)</option>
                <option value={15}>15 Tahun (180 Bulan)</option>
                <option value={20}>20 Tahun (240 Bulan)</option>
                <option value={25}>25 Tahun (300 Bulan)</option>
              </select>
            </div>
          </div>

          {/* Custom Scheme Controls */}

          {/* SKEMA 1: Bank Umum (Flat Fixed -> Floating) */}
          {scheme === 'bank_flat_floating' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
                <span>Atur Masa Bunga Fixed & Floating Bank</span>
                <span className="text-[10px] text-slate-500">Contoh: BTN, Mandiri, BCA</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Lama Masa Fixed
                  </label>
                  <select
                    value={fixedYears}
                    onChange={(e) => setFixedYears(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold"
                  >
                    <option value={1}>1 Tahun</option>
                    <option value={2}>2 Tahun</option>
                    <option value={3}>3 Tahun</option>
                    <option value={5}>5 Tahun</option>
                    <option value={10}>10 Tahun</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bunga Fixed (%/thn)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={fixedRate}
                    onChange={(e) => setFixedRate(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Est. Floating (%/thn)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={floatingRate}
                    onChange={(e) => setFloatingRate(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-rose-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SKEMA 2: Bunga Berjenjang */}
          {scheme === 'bunga_berjenjang' && (
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-3 text-xs">
              <div className="font-bold text-amber-950 border-b border-amber-200 pb-2 flex justify-between items-center">
                <span>Pengaturan Suku Bunga Berjenjang (Atur Durasi per Tahap)</span>
                <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-extrabold">
                  Step-Up Rate Custom
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tahap I */}
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                  <div className="font-extrabold text-slate-800 flex justify-between items-center">
                    <span>Tahap I</span>
                    <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                      Thn 1 - {actualTier1Years}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Pilih Durasi Tahap I</label>
                    <select
                      value={tier1Years}
                      onChange={(e) => setTier1Years(Number(e.target.value))}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                    >
                      {Array.from({ length: tenorYears - 1 }, (_, i) => i + 1).map((yr) => (
                        <option key={yr} value={yr}>
                          {yr} Tahun
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Suku Bunga (%/thn)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={tier1Rate}
                      onChange={(e) => setTier1Rate(Number(e.target.value) || 0)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-700"
                    />
                  </div>
                </div>

                {/* Tahap II */}
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                  <div className="font-extrabold text-slate-800 flex justify-between items-center">
                    <span>Tahap II</span>
                    {remainingTenorAfterTier1 > 0 ? (
                      <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                        Thn {actualTier1Years + 1} - {actualTier1Years + actualTier2Years}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">(Selesai)</span>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Pilih Durasi Tahap II</label>
                    <select
                      value={tier2Years}
                      onChange={(e) => setTier2Years(Number(e.target.value))}
                      disabled={remainingTenorAfterTier1 <= 0}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 disabled:opacity-50"
                    >
                      {remainingTenorAfterTier1 > 0 ? (
                        Array.from({ length: remainingTenorAfterTier1 }, (_, i) => i + 1).map((yr) => (
                          <option key={yr} value={yr}>
                            {yr} Tahun
                          </option>
                        ))
                      ) : (
                        <option value={0}>0 Tahun</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Suku Bunga (%/thn)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={tier2Rate}
                      onChange={(e) => setTier2Rate(Number(e.target.value) || 0)}
                      disabled={remainingTenorAfterTier1 <= 0}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-700 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Tahap III */}
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                  <div className="font-extrabold text-slate-800 flex justify-between items-center">
                    <span>Tahap III (Sisa)</span>
                    {remainingTenorAfterTier2 > 0 ? (
                      <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                        Thn {actualTier1Years + actualTier2Years + 1} - {tenorYears}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">(Lunas)</span>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Durasi Sisa Tenor</label>
                    <div className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 text-xs">
                      {remainingTenorAfterTier2} Tahun
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Suku Bunga (%/thn)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={tier3Rate}
                      onChange={(e) => setTier3Rate(Number(e.target.value) || 0)}
                      disabled={remainingTenorAfterTier2 <= 0}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-rose-700 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SKEMA 3: KPR Syariah */}
          {scheme === 'kpr_syariah' && (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 space-y-3 text-xs">
              <div className="font-bold text-emerald-950 border-b border-emerald-200 pb-2 flex justify-between">
                <span>Skema Margin Pembiayaan KPR Syariah (Akad Murabahah)</span>
                <span className="text-[10px] text-emerald-800 font-bold">Bebas Riba & Denda</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Margin Syariah Setara Flat (%/tahun)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={syariahMarginFlat}
                    onChange={(e) => setSyariahMarginFlat(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kepastian Angsuran</label>
                  <div className="p-2 bg-white border border-emerald-200 rounded-xl font-bold text-emerald-900 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Flat / Tetap Selama {tenorYears} Tahun</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            💡 <span className="font-bold">Informasi Yusuf Property:</span> Bank BTN, BSI, Mandiri, BCA & BSI Syariah merupakan bank mitra resmi Yusuf Property dengan jaminan ACC cepat & promo keringanan biaya awal.
          </div>
        </div>

        {/* Results Column Right */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>HASIL SIMULASI ANGSURAN</span>
              </span>
              <span className="text-[11px] text-slate-400">Yusuf Property</span>
            </div>

            {/* Scheme 1 Display Result */}
            {scheme === 'bank_flat_floating' && (
              <div className="space-y-3">
                {/* Masa Fixed */}
                <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-slate-950 space-y-1 shadow-md">
                  <div className="flex justify-between items-center text-xs font-bold uppercase opacity-90">
                    <span>Masa Bunga Fixed (Thn 1 - {actualFixedYears})</span>
                    <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px]">
                      {fixedRate}% Flat
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight">
                    {formatRupiah(monthlyFixed)} <span className="text-xs font-normal">/ bln</span>
                  </div>
                </div>

                {/* Masa Floating */}
                <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700/80 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-400 font-bold">
                    <span>Masa Floating (Thn {actualFixedYears + 1} - {tenorYears})</span>
                    <span className="text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded text-[10px]">
                      Est {floatingRate}%
                    </span>
                  </div>
                  <div className="text-xl font-black text-rose-300">
                    {formatRupiah(monthlyFloating)} <span className="text-xs font-normal text-slate-400">/ bln</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">
                    *Sisa pokok KPR saat masuk floating: {formatRupiah(remainingPrincipalAfterFixed)}
                  </p>
                </div>
              </div>
            )}

            {/* Scheme 2 Display Result (Berjenjang) */}
            {scheme === 'bunga_berjenjang' && (
              <div className="space-y-2 text-xs">
                {/* Tahap 1 */}
                <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-slate-950 space-y-1 shadow-sm">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase">
                    <span>Tahap I (Tahun 1 - {actualTier1Years})</span>
                    <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[9px]">
                      Bunga {tier1Rate}%
                    </span>
                  </div>
                  <div className="text-xl font-black">{formatRupiah(monthlyTier1)} / bln</div>
                </div>

                {/* Tahap 2 */}
                {actualTier2Years > 0 && (
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1 text-slate-200">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400">
                        Tahap II (Tahun {actualTier1Years + 1} - {actualTier1Years + actualTier2Years})
                      </span>
                      <span className="text-amber-400 bg-amber-950 px-2 py-0.5 rounded text-[9px]">
                        Bunga {tier2Rate}%
                      </span>
                    </div>
                    <div className="text-lg font-bold text-amber-300">{formatRupiah(monthlyTier2)} / bln</div>
                  </div>
                )}

                {/* Tahap 3 */}
                {remainingTenorAfterTier2 > 0 && (
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1 text-slate-200">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400">
                        Tahap III (Tahun {actualTier1Years + actualTier2Years + 1} - {tenorYears})
                      </span>
                      <span className="text-rose-400 bg-rose-950 px-2 py-0.5 rounded text-[9px]">
                        Bunga {tier3Rate}%
                      </span>
                    </div>
                    <div className="text-lg font-bold text-rose-300">{formatRupiah(monthlyTier3)} / bln</div>
                  </div>
                )}
              </div>
            )}

            {/* Scheme 3 Display Result (Syariah) */}
            {scheme === 'kpr_syariah' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-slate-950 space-y-1 shadow-md">
                  <div className="flex justify-between items-center text-xs font-bold uppercase">
                    <span>Angsuran Syariah Tetap (Akad Murabahah)</span>
                    <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
                      Flat {syariahMarginFlat}% / thn
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight">
                    {formatRupiah(monthlySyariah)} <span className="text-xs font-normal">/ bln</span>
                  </div>
                  <p className="text-[10px] font-semibold opacity-90 pt-1">
                    Tetap Rp {formatRupiah(monthlySyariah)}/bulan dari bulan 1 s/d bulan {tenorYears * 12}.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Total Margin Syariah ({tenorYears} Thn):</span>
                    <span className="text-emerald-400 font-bold">{formatRupiah(totalSyariahMargin)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-bold text-xs pt-1 border-t border-slate-700">
                    <span>Total Harga Jual Pembiayaan:</span>
                    <span className="text-white">{formatRupiah(totalSyariahPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Syarat Minimal Gaji */}
            <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-0.5 text-xs">
              <span className="text-slate-400 text-[11px]">Estimasi Syarat Minimal Gaji Gabungan:</span>
              <div className="text-base font-bold text-emerald-400">
                {formatRupiah(minRequiredIncome)} / bulan
              </div>
            </div>

            {/* Breakdown Biaya Awal Akad */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between">
                <span>Estimasi Biaya Awal Akad:</span>
                <span className="text-amber-400">{formatRupiah(totalBiayaAwalEst)}</span>
              </div>

              <div className="space-y-1 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Uang Muka (DP {dpPercent}%):</span>
                  <span className="font-bold text-slate-200">{formatRupiah(dpAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BPHTB (Pajak Pembeli):</span>
                  <span className="text-slate-300">{formatRupiah(bphtbPajak)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Notaris & Balik Nama SHM:</span>
                  <span className="text-slate-300">{formatRupiah(biayaNotaris)}</span>
                </div>
                {scheme !== 'kpr_syariah' && (
                  <div className="flex justify-between">
                    <span>Provisi & Admin Bank:</span>
                    <span className="text-slate-300">{formatRupiah(provisiBank)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Asuransi KPR (Jiwa & Kebakaran):</span>
                  <span className="text-slate-300">{formatRupiah(asuransiEst)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Simulasi bersifat estimasi, persetujuan & bunga akhir ditentukan bank mitra.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
