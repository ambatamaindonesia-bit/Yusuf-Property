export type UserRole = 'Super Admin' | 'Manager Marketing' | 'Finance & Kasir' | 'Legal & Sertifikat' | 'Sales Marketing';

export type MarketingType = 'Inhouse' | 'Agent' | '-';

export type TabType =
  | 'dashboard'
  | 'projects'
  | 'siteplan'
  | 'sales'
  | 'user_data'
  | 'employees'
  | 'user_access'
  | 'kpr_calc'
  | 'construction'
  | 'finance'
  | 'reports';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  marketingType: MarketingType;
  agencyName?: string; // e.g. 'Era Yusuf' or 'Independent Agent'
  phone: string;
  status: 'Aktif' | 'Nonaktif';
  commissionRatePercent?: number;
  notes?: string;
  allowedTabs?: TabType[]; // Specific menu permissions set by admin
}

export const ALL_TAB_ITEMS: { id: TabType; label: string; description: string; superAdminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard Overview', description: 'Metrik umum, ringkasan stok, dan omset' },
  { id: 'projects', label: 'Proyek Perumahan', description: 'Kelola data proyek & master lokasi' },
  { id: 'siteplan', label: 'Site Plan & Stok Unit', description: 'Peta denah visual & ketersediaan kavling' },
  { id: 'sales', label: 'Penjualan & KPR (SPR)', description: 'Pemesanan rumah & status pemberkasan KPR' },
  { id: 'user_data', label: 'Data User & Berkas KPR', description: 'Profil konsumen, KTP, KK, & syarat KPR' },
  { id: 'employees', label: 'Karyawan & Marketing', description: 'Data sales inhouse & broker agen' },
  { id: 'user_access', label: 'Kelola Akses User ERP', description: 'Hak akses & manajemen akun (Khusus Admin)', superAdminOnly: true },
  { id: 'kpr_calc', label: 'Kalkulator KPR', description: 'Simulasi angsuran & bunga bank' },
  { id: 'construction', label: 'Konstruksi & Mandor', description: 'Progress fisik bangunan & SPK mandor' },
  { id: 'finance', label: 'Keuangan & Cashflow', description: 'Jurnal kas, cash in/out & saldo' },
  { id: 'reports', label: 'Laporan ERP Developer', description: 'Laporan keuangan, omset & stok unit' },
];

export const DEFAULT_ROLE_TABS: Record<UserRole, TabType[]> = {
  'Super Admin': [
    'dashboard', 'projects', 'siteplan', 'sales', 'user_data',
    'employees', 'user_access', 'kpr_calc', 'construction', 'finance', 'reports'
  ],
  'Manager Marketing': [
    'dashboard', 'projects', 'siteplan', 'sales', 'user_data',
    'employees', 'kpr_calc', 'reports'
  ],
  'Finance & Kasir': [
    'dashboard', 'projects', 'siteplan', 'sales', 'user_data',
    'finance', 'reports', 'kpr_calc'
  ],
  'Legal & Sertifikat': [
    'dashboard', 'projects', 'sales', 'user_data', 'reports'
  ],
  'Sales Marketing': [
    'dashboard', 'projects', 'siteplan', 'sales', 'user_data', 'kpr_calc'
  ],
};

export function getUserAllowedTabs(user: AppUser | null): TabType[] {
  if (!user) return ['dashboard'];

  let tabs: TabType[] = [];
  if (user.allowedTabs && user.allowedTabs.length > 0) {
    tabs = [...user.allowedTabs];
  } else {
    tabs = DEFAULT_ROLE_TABS[user.role] || DEFAULT_ROLE_TABS['Sales Marketing'];
  }

  // Ensure user_access is strictly removed for non-Super Admin
  if (user.role !== 'Super Admin') {
    tabs = tabs.filter((t) => t !== 'user_access');
  }

  // Fallback if empty
  if (tabs.length === 0) {
    tabs = ['dashboard'];
  }

  return tabs;
}

export type UnitStatus = 'available' | 'booking' | 'sold' | 'construction' | 'reserved';

export type PaymentType = 'cash_keras' | 'cash_bertahap' | 'kpr';

export type KprStatus = 
  | 'pemberkasan' 
  | 'wawancara' 
  | 'analisis_bank' 
  | 'sp3k_disetujui' 
  | 'akad_kredit' 
  | 'cair_stage_1' 
  | 'cair_100';

export interface Unit {
  id: string;
  projectId: string;
  projectName: string;
  block: string;
  number: string;
  unitCode: string; // e.g. A-01
  type: string; // e.g. Tipe 36/72, Tipe 45/90
  landArea: number; // m2
  buildingArea: number; // m2
  priceCash: number;
  priceKpr: number;
  bookingFee: number;
  minDp: number;
  status: UnitStatus;
  progressPercent: number; // 0 - 100%
  facing: 'Utara' | 'Selatan' | 'Timur' | 'Barat';
  bedrooms: number;
  bathrooms: number;
  specifications: {
    pondasi: string;
    dinding: string;
    atap: string;
    lantai: string;
    listrik: string;
    air: string;
  };
  notes?: string;
}

export interface HousingProject {
  id: string;
  name: string; // e.g. Yusuf Grand Residence
  location: string; // e.g. Sukajadi, Bandung / Cibubur, Bogor
  city: string;
  totalUnits: number;
  unitsAvailable: number;
  unitsBooking: number;
  unitsSold: number;
  landSizeHa: number; // Hektar
  status: 'planning' | 'active' | 'sold_out' | 'handover';
  developerLegal: string; // e.g. PT Yusuf Property Indonesia - SHGB & PBG Lengkap
  startingPrice: number;
  facilities: string[];
  imageUrl?: string;
}

export interface Buyer {
  id: string;
  name: string;
  nik: string;
  phone: string;
  email: string;
  address: string;
  job: string;
  monthlyIncome: number;
}

export interface SalesTransaction {
  id: string;
  sprNumber: string; // e.g. SPR/YP/2026/089
  unitId: string;
  unitCode: string;
  projectName: string;
  buyer: Buyer;
  marketingAgent: string;
  transactionDate: string;
  paymentType: PaymentType;
  agreedPrice: number;
  bookingFeePaid: number;
  dpAmount: number;
  dpPaid: number;
  kprBank?: string; // BTN, BSI, Mandiri, BRI, etc.
  kprAmount?: number;
  kprStatus?: KprStatus;
  sp3kNumber?: string;
  sp3kDate?: string;
  notes?: string;
}

export interface ConstructionMilestone {
  id: string;
  unitId: string;
  unitCode: string;
  projectName: string;
  contractorName: string;
  stageName: string; // e.g. Pekerjaan Pondasi & Stiuktur, Pasang Bata & Plester, Atap & Plafon, Finishing
  targetCompletionDate: string;
  progressPercent: number;
  budgetAllocated: number;
  budgetSpent: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  lastUpdated: string;
}

export interface TransactionAuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'EDIT' | 'DELETE';
  user: string;
  reason: string;
  changesSummary?: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'dp_pembayaran' | 'pencairan_kpr' | 'booking_fee' | 'material_konstruksi' | 'gaji_mandor' | 'legal_sertifikat' | 'pemasaran' | 'lainnya';
  title: string;
  amount: number;
  projectName: string;
  unitCode?: string;
  paymentMethod: string;
  payerName?: string;
  payerRelationship?: string;
  refNumber: string;
  recordedBy: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deleteReason?: string;
  deletedBy?: string;
  auditLogs?: TransactionAuditLog[];
}

export type KprDocumentStatus = 'belum_ada' | 'terupload' | 'terverifikasi' | 'ditolak';

export interface KprDocumentItem {
  id: string;
  code: string;
  name: string;
  category: 'Identitas Pribadi' | 'Dokumen Legalitas' | 'Penghasilan & Pekerjaan' | 'Formulir Bank & Perusahaan';
  isRequired: boolean;
  status: KprDocumentStatus;
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
  fileUrl?: string;
  notes?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  nik: string;
  phone: string;
  email: string;
  address: string;
  maritalStatus: 'Lajang' | 'Menikah' | 'Duda / Janda';
  jobTitle: string;
  companyName: string;
  monthlyIncome: number;
  projectName: string;
  unitCode: string;
  kprBankTarget: string;
  kprPlafonRequest: number;
  statusPemberkasan: 'Belum Lengkap' | 'Lengkap & Terverifikasi' | 'Dalam Proses Bank';
  documents: KprDocumentItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KprSimulationQuery {
  price: number;
  dpPercent: number;
  interestRateYear: number;
  tenorYears: number;
}
