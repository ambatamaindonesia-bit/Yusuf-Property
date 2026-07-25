import { KprStatus, UnitStatus } from '../types';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatRupiahShort = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(0)} Jt`;
  }
  return formatRupiah(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const calculateKprMonthly = (
  loanAmount: number,
  interestRateAnnual: number,
  tenorYears: number
): number => {
  if (loanAmount <= 0 || tenorYears <= 0) return 0;
  const monthlyRate = interestRateAnnual / 100 / 12;
  const numberOfPayments = tenorYears * 12;
  if (monthlyRate === 0) return loanAmount / numberOfPayments;
  
  const monthlyPayment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return Math.round(monthlyPayment);
};

export const calculateRemainingPrincipal = (
  loanAmount: number,
  interestRateAnnual: number,
  totalTenorYears: number,
  elapsedYears: number
): number => {
  if (loanAmount <= 0 || totalTenorYears <= 0 || elapsedYears >= totalTenorYears) return 0;
  const r = interestRateAnnual / 100 / 12;
  const N = totalTenorYears * 12;
  const m = elapsedYears * 12;
  if (r === 0) return loanAmount * (1 - m / N);
  const remaining = loanAmount * ((Math.pow(1 + r, N) - Math.pow(1 + r, m)) / (Math.pow(1 + r, N) - 1));
  return Math.max(0, Math.round(remaining));
};

export const getUnitStatusBadge = (status: UnitStatus) => {
  switch (status) {
    case 'available':
      return { label: 'Tersedia', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    case 'booking':
      return { label: 'Booking / SPR', bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
    case 'sold':
      return { label: 'Terjual / Akad', bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
    case 'construction':
      return { label: 'Proses Bangun', bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' };
    case 'reserved':
      return { label: 'Hold / NUP', bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-500' };
  }
};

export const getKprStatusLabel = (status?: KprStatus) => {
  switch (status) {
    case 'pemberkasan': return { label: '1. Pemberkasan Berkas', step: 1, color: 'text-amber-600 bg-amber-50' };
    case 'wawancara': return { label: '2. Wawancara Bank', step: 2, color: 'text-blue-600 bg-blue-50' };
    case 'analisis_bank': return { label: '3. Analisis Kredit', step: 3, color: 'text-purple-600 bg-purple-50' };
    case 'sp3k_disetujui': return { label: '4. SP3K Terbit (ACC)', step: 4, color: 'text-indigo-600 bg-indigo-50' };
    case 'akad_kredit': return { label: '5. Pre-Akad & Akad', step: 5, color: 'text-teal-600 bg-teal-50' };
    case 'cair_stage_1': return { label: '6. Pencairan Tahap I', step: 6, color: 'text-emerald-600 bg-emerald-50' };
    case 'cair_100': return { label: '7. Lunas / Cair 100%', step: 7, color: 'text-green-700 bg-green-100' };
    default: return { label: 'Belum KPR / Non-KPR', step: 0, color: 'text-slate-500 bg-slate-100' };
  }
};
