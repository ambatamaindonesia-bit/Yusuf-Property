export type UserRole = 'Super Admin' | 'Manager Marketing' | 'Finance & Kasir' | 'Legal & Sertifikat' | 'Sales Marketing';

export type MarketingType = 'Inhouse' | 'Agent' | '-';

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
