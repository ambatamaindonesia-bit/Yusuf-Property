import React, { useState, useMemo } from 'react';
import { CustomerProfile, KprDocumentItem, KprDocumentStatus, FinancialRecord, SalesTransaction, Unit, AppUser, HousingProject, UnitStatus } from '../types';
import { formatDate, formatRupiah } from '../utils/formatters';
import {
  FolderCheck,
  UserCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  Edit3,
  Search,
  Briefcase,
  FileCheck,
  Paperclip,
  Eye,
  Receipt,
  Printer,
  DollarSign,
  Wallet,
  ArrowUpRight,
  User,
  Building,
  CreditCard,
  X,
  History,
} from 'lucide-react';

export const DEFAULT_DOCUMENT_TEMPLATES: Omit<KprDocumentItem, 'id' | 'status'>[] = [
  {
    code: 'ktp',
    name: 'Photocopy / Scan KTP Pemohon & Pasangan (Suami/Istri)',
    category: 'Identitas Pribadi',
    isRequired: true,
    notes: 'Wajib masih berlaku / e-KTP terdaftar di Ditjen Dukcapil',
  },
  {
    code: 'kk',
    name: 'Photocopy / Scan Kartu Keluarga (KK)',
    category: 'Identitas Pribadi',
    isRequired: true,
    notes: 'Sesuai dengan alamat e-KTP pemohon',
  },
  {
    code: 'pasfoto',
    name: 'Pasfoto Berwarna 3x4 (Pemohon & Pasangan)',
    category: 'Identitas Pribadi',
    isRequired: false,
    notes: 'Latar belakang merah atau biru (2 lembar)',
  },
  {
    code: 'surat_nikah',
    name: 'Surat / Akta Nikah / Akta Cerai / Surat Keterangan Belum Menikah',
    category: 'Dokumen Legalitas',
    isRequired: true,
    notes: 'Legalisir KUA/Catatan Sipil atau Desa setempat',
  },
  {
    code: 'npwp',
    name: 'Photocopy NPWP Pribadi & Surat Keterangan Pajak',
    category: 'Dokumen Legalitas',
    isRequired: true,
    notes: 'Valid & status SPT Tahunan aktif',
  },
  {
    code: 'slip_gaji',
    name: 'Slip Gaji 3 Bulan Terakhir / Surat Keterangan Penghasilan',
    category: 'Penghasilan & Pekerjaan',
    isRequired: true,
    notes: 'Stempel asli & tanda tangan bagian HRD/Finance perusahaan',
  },
  {
    code: 'rekening_koran',
    name: 'Rekening Koran Tabungan 3-6 Bulan Terakhir',
    category: 'Penghasilan & Pekerjaan',
    isRequired: true,
    notes: 'Cetak dari bank penerbit gaji / usaha',
  },
  {
    code: 'sk_kerja',
    name: 'Surat Keterangan Kerja (SK Karyawan Tetap) / SIUP & NIB Usaha',
    category: 'Penghasilan & Pekerjaan',
    isRequired: true,
    notes: 'Masa kerja minimal 1-2 tahun',
  },
  {
    code: 'spt_pribadi',
    name: 'SPT PPh Pasal 21 Pribadi Tahunan',
    category: 'Penghasilan & Pekerjaan',
    isRequired: false,
    notes: 'Bukti lapor pajak tahun terakhir',
  },
  {
    code: 'form_kpr',
    name: 'Formulir Permohonan KPR Bank & Data Profil Konsumen Perusahaan',
    category: 'Formulir Bank & Perusahaan',
    isRequired: true,
    notes: 'Ditandatangani pemohon di atas materai Rp 10.000',
  },
];

function terbilang(n: number): string {
  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  if (n < 12) return angka[n];
  if (n < 20) return terbilang(n - 10) + ' Belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + (n % 10 !== 0 ? ' ' + terbilang(n % 10) : '');
  if (n < 200) return 'Seratus ' + (n % 100 !== 0 ? terbilang(n - 100) : '');
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + (n % 100 !== 0 ? ' ' + terbilang(n % 100) : '');
  if (n < 2000) return 'Seribu ' + (n % 1000 !== 0 ? terbilang(n - 1000) : '');
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + (n % 1000 !== 0 ? ' ' + terbilang(n % 1000) : '');
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' Juta ' + (n % 1000000 !== 0 ? ' ' + terbilang(n % 1000000) : '');
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' Milyar ' + (n % 1000000000 !== 0 ? ' ' + terbilang(n % 1000000000) : '');
  return n.toLocaleString('id-ID');
}

interface UserDataManagerProps {
  customers: CustomerProfile[];
  sales?: SalesTransaction[];
  finances?: FinancialRecord[];
  units?: Unit[];
  projects?: HousingProject[];
  onAddCustomer: (customer: CustomerProfile) => void;
  onUpdateCustomer: (customer: CustomerProfile) => void;
  onDeleteCustomer: (id: string) => void;
  onAddFinanceRecord?: (record: FinancialRecord) => void;
  onUpdateUnitStatus?: (unitId: string, newStatus: UnitStatus) => void;
  currentUser?: AppUser | null;
}

export const UserDataManager: React.FC<UserDataManagerProps> = ({
  customers,
  sales = [],
  finances = [],
  units = [],
  projects = [],
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddFinanceRecord,
  onUpdateUnitStatus,
  currentUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'user_files' | 'payment_history'>('user_files');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    customers.length > 0 ? customers[0].id : null
  );

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [printingReceipt, setPrintingReceipt] = useState<FinancialRecord | null>(null);

  // Edit Document Modal
  const [editingDoc, setEditingDoc] = useState<KprDocumentItem | null>(null);

  // New Customer Form State
  const [custName, setCustName] = useState('');
  const [custNik, setCustNik] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custMaritalStatus, setCustMaritalStatus] = useState<'Lajang' | 'Menikah' | 'Duda / Janda'>('Menikah');
  const [custJobTitle, setCustJobTitle] = useState('Karyawan Swasta');
  const [custCompanyName, setCustCompanyName] = useState('');
  const [custMonthlyIncome, setCustMonthlyIncome] = useState(12000000);
  const [custProjectName, setCustProjectName] = useState('Grand Yusuf Residence');
  const [custUnitCode, setCustUnitCode] = useState('A-01');
  const [custKprBankTarget, setCustKprBankTarget] = useState('Bank BTN');
  const [custKprPlafonRequest, setCustKprPlafonRequest] = useState(400000000);
  const [custNotes, setCustNotes] = useState('');
  const [custUtjPaid, setCustUtjPaid] = useState(3000000);
  const [custPaymentMethod, setCustPaymentMethod] = useState('Transfer Bank BTN');
  const [custMarketingAgent, setCustMarketingAgent] = useState(currentUser?.name || 'Agus Marketing');

  const isSalesMarketing = currentUser?.role === 'Sales Marketing';

  // New Payment Modal Form State
  const [payCategory, setPayCategory] = useState<'booking_fee' | 'dp_pembayaran' | 'pelunasan_unit' | 'pencairan_kpr'>('dp_pembayaran');
  const [payAmount, setPayAmount] = useState<number>(10000000);
  const [payMethod, setPayMethod] = useState('Transfer Bank BTN');
  const [payNotes, setPayNotes] = useState('Pembayaran Angsuran Konsumen');

  // New Custom Document Form
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'Identitas Pribadi' | 'Dokumen Legalitas' | 'Penghasilan & Pekerjaan' | 'Formulir Bank & Perusahaan'>('Penghasilan & Pekerjaan');
  const [newDocIsRequired, setNewDocIsRequired] = useState(true);
  const [newDocNotes, setNewDocNotes] = useState('');

  // Currently Selected Customer
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;

  // Filtered Customer List
  const filteredCustomers = customers.filter((c) => {
    // If user is Sales Marketing, filter to only show their assigned customers
    if (isSalesMarketing && currentUser?.name) {
      const isMine = !c.marketingAgent || c.marketingAgent.toLowerCase().includes(currentUser.name.toLowerCase());
      if (!isMine) return false;
    }

    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nik.includes(searchTerm) ||
      c.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.marketingAgent && c.marketingAgent.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === 'all') return matchSearch;
    return matchSearch && c.statusPemberkasan === filterStatus;
  });

  // Calculate overall stats
  const totalCustomersCount = customers.length;
  const completeCustomersCount = customers.filter((c) => c.statusPemberkasan === 'Lengkap & Terverifikasi').length;
  const inProgressCustomersCount = customers.filter((c) => c.statusPemberkasan === 'Dalam Proses Bank' || c.statusPemberkasan === 'Belum Lengkap').length;

  // Derive projects list from system projects or units
  const projectOptions = useMemo(() => {
    if (projects && projects.length > 0) {
      return projects.map((p) => p.name);
    }
    const unitProjects = Array.from(new Set(units.map((u) => u.projectName))).filter(Boolean);
    return unitProjects.length > 0 ? unitProjects : ['Grand Yusuf Residence', 'Yusuf Royal City', 'Yusuf Residence Modern'];
  }, [projects, units]);

  // Available units for registration (filtered by current custProjectName and status 'available')
  const availableUnitsForRegistration = useMemo(() => {
    return units.filter(
      (u) =>
        u.projectName.toLowerCase() === custProjectName.toLowerCase() &&
        u.status === 'available'
    );
  }, [units, custProjectName]);

  // Available units for editing selected customer (includes available units + currently assigned unit)
  const availableUnitsForEdit = useMemo(() => {
    return units.filter(
      (u) =>
        u.projectName.toLowerCase() === custProjectName.toLowerCase() &&
        (u.status === 'available' || u.unitCode === selectedCustomer?.unitCode)
    );
  }, [units, custProjectName, selectedCustomer]);

  // Project change handler
  const handleProjectChange = (projectName: string) => {
    setCustProjectName(projectName);
    const avail = units.filter(
      (u) => u.projectName.toLowerCase() === projectName.toLowerCase() && u.status === 'available'
    );
    if (avail.length > 0) {
      setCustUnitCode(avail[0].unitCode);
      setCustKprPlafonRequest(avail[0].priceKpr);
      setCustUtjPaid(avail[0].bookingFee);
    } else {
      setCustUnitCode('');
    }
  };

  // Unit code change handler
  const handleUnitCodeChange = (unitCode: string) => {
    setCustUnitCode(unitCode);
    const found = units.find(
      (u) =>
        u.projectName.toLowerCase() === custProjectName.toLowerCase() &&
        u.unitCode.toLowerCase() === unitCode.toLowerCase()
    );
    if (found) {
      setCustKprPlafonRequest(found.priceKpr);
      setCustUtjPaid(found.bookingFee);
    }
  };

  // Open modal handler for Add Customer
  const handleOpenAddModal = () => {
    const defaultProj = projectOptions[0] || 'Grand Yusuf Residence';
    const avail = units.filter(
      (u) => u.projectName.toLowerCase() === defaultProj.toLowerCase() && u.status === 'available'
    );
    setCustName('');
    setCustNik('');
    setCustPhone('');
    setCustEmail('');
    setCustAddress('');
    setCustMaritalStatus('Menikah');
    setCustJobTitle('Karyawan Swasta');
    setCustCompanyName('');
    setCustMonthlyIncome(12000000);
    setCustProjectName(defaultProj);
    setCustUnitCode(avail[0]?.unitCode || '');
    setCustKprBankTarget('Bank BTN');
    setCustKprPlafonRequest(avail[0]?.priceKpr || 400000000);
    setCustUtjPaid(avail[0]?.bookingFee || 3000000);
    setCustPaymentMethod('Transfer Bank BTN');
    setCustNotes('');
    setCustMarketingAgent(currentUser?.name || 'Agus Marketing');
    setShowAddModal(true);
  };

  // Helper create default docs for a new customer
  const createDefaultDocs = (): KprDocumentItem[] => {
    return DEFAULT_DOCUMENT_TEMPLATES.map((tmpl, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      code: tmpl.code,
      name: tmpl.name,
      category: tmpl.category,
      isRequired: tmpl.isRequired,
      status: 'belum_ada',
      notes: tmpl.notes,
    }));
  };

  // Submit New Customer
  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custNik) return;

    const newCustomer: CustomerProfile = {
      id: `cust-${Date.now()}`,
      name: custName,
      nik: custNik,
      phone: custPhone,
      email: custEmail,
      address: custAddress,
      maritalStatus: custMaritalStatus,
      jobTitle: custJobTitle,
      companyName: custCompanyName,
      monthlyIncome: custMonthlyIncome,
      projectName: custProjectName,
      unitCode: custUnitCode,
      kprBankTarget: custKprBankTarget,
      kprPlafonRequest: custKprPlafonRequest,
      statusPemberkasan: 'Belum Lengkap',
      marketingAgent: isSalesMarketing ? (currentUser?.name || 'Marketing') : custMarketingAgent,
      documents: createDefaultDocs(),
      notes: custNotes,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onAddCustomer(newCustomer);
    setSelectedCustomerId(newCustomer.id);

    // Update unit status to 'booking' if available unit was selected
    const targetUnit = units.find(
      (u) =>
        u.projectName.toLowerCase() === custProjectName.toLowerCase() &&
        u.unitCode.toLowerCase() === custUnitCode.toLowerCase()
    );
    if (targetUnit && onUpdateUnitStatus && targetUnit.status === 'available') {
      onUpdateUnitStatus(targetUnit.id, 'booking');
    }

    // Auto record UTJ / Initial Payment into Financial Journal
    if (custUtjPaid > 0 && onAddFinanceRecord) {
      const nowStr = new Date().toLocaleString('id-ID');
      const recordedBy = currentUser ? currentUser.name : 'System Auto-ERP';
      const financeEntry: FinancialRecord = {
        id: `fin-${Date.now()}-utj`,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'booking_fee',
        title: `Penerimaan UTJ / Booking Fee Konsumen Baru - Unit ${custUnitCode} a.n. ${custName}`,
        amount: custUtjPaid,
        projectName: custProjectName,
        unitCode: custUnitCode,
        paymentMethod: custPaymentMethod,
        payerName: custName,
        payerRelationship: 'Konsumen Langsung (Pribadi)',
        refNumber: `UTJ/YP/${Math.floor(1000 + Math.random() * 9000)}`,
        recordedBy,
        auditLogs: [
          {
            id: `log-${Date.now()}-cust`,
            timestamp: nowStr,
            action: 'CREATE',
            user: recordedBy,
            reason: 'Otomatisasi pencatatan UTJ dari pendaftaran konsumen baru',
            changesSummary: `UTJ Terbayar Rp ${custUtjPaid.toLocaleString('id-ID')}`,
          },
        ],
      };
      onAddFinanceRecord(financeEntry);
    }

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setCustName('');
    setCustNik('');
    setCustPhone('');
    setCustEmail('');
    setCustAddress('');
    setCustCompanyName('');
    setCustNotes('');
    setCustUtjPaid(3000000);
  };

  // Edit Customer Open
  const handleOpenEditCustomer = () => {
    if (!selectedCustomer) return;
    setCustName(selectedCustomer.name);
    setCustNik(selectedCustomer.nik);
    setCustPhone(selectedCustomer.phone);
    setCustEmail(selectedCustomer.email);
    setCustAddress(selectedCustomer.address);
    setCustMaritalStatus(selectedCustomer.maritalStatus);
    setCustJobTitle(selectedCustomer.jobTitle);
    setCustCompanyName(selectedCustomer.companyName);
    setCustMonthlyIncome(selectedCustomer.monthlyIncome);
    setCustProjectName(selectedCustomer.projectName);
    setCustUnitCode(selectedCustomer.unitCode);
    setCustKprBankTarget(selectedCustomer.kprBankTarget);
    setCustKprPlafonRequest(selectedCustomer.kprPlafonRequest);
    setCustNotes(selectedCustomer.notes || '');
    setShowEditCustomerModal(true);
  };

  const handleSaveEditedCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const updated: CustomerProfile = {
      ...selectedCustomer,
      name: custName,
      nik: custNik,
      phone: custPhone,
      email: custEmail,
      address: custAddress,
      maritalStatus: custMaritalStatus,
      jobTitle: custJobTitle,
      companyName: custCompanyName,
      monthlyIncome: custMonthlyIncome,
      projectName: custProjectName,
      unitCode: custUnitCode,
      kprBankTarget: custKprBankTarget,
      kprPlafonRequest: custKprPlafonRequest,
      notes: custNotes,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateCustomer(updated);
    setShowEditCustomerModal(false);
  };

  // Delete Customer
  const handleDeleteCustomerProfile = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data konsumen ini beserta seluruh checklist berkas KPR-nya?')) {
      onDeleteCustomer(id);
      if (selectedCustomerId === id) {
        const remaining = customers.filter((c) => c.id !== id);
        setSelectedCustomerId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  // Submit New Payment for User
  const handleSaveNewUserPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !onAddFinanceRecord) return;

    const nowStr = new Date().toLocaleString('id-ID');
    const recordedBy = currentUser ? currentUser.name : 'System Auto-ERP';
    const catLabel =
      payCategory === 'booking_fee'
        ? 'UTJ / Booking Fee'
        : payCategory === 'dp_pembayaran'
        ? 'Uang Muka (DP)'
        : payCategory === 'pelunasan_unit'
        ? 'Pelunasan Cash Unit'
        : 'Pencairan KPR Bank';

    const newFinance: FinancialRecord = {
      id: `fin-${Date.now()}-custpay`,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: payCategory,
      title: `Penerimaan ${catLabel} - Unit ${selectedCustomer.unitCode} a.n. ${selectedCustomer.name}`,
      amount: payAmount,
      projectName: selectedCustomer.projectName,
      unitCode: selectedCustomer.unitCode,
      paymentMethod: payMethod,
      payerName: selectedCustomer.name,
      payerRelationship: 'Konsumen Langsung (Pribadi)',
      refNumber: `KWT/YP/${Math.floor(1000 + Math.random() * 9000)}`,
      recordedBy,
      auditLogs: [
        {
          id: `log-${Date.now()}-pay`,
          timestamp: nowStr,
          action: 'CREATE',
          user: recordedBy,
          reason: `Pencatatan pembayaran ${catLabel} konsumen dari menu Data User`,
          changesSummary: `Penerimaan ${catLabel} Rp ${payAmount.toLocaleString('id-ID')}`,
        },
      ],
    };

    onAddFinanceRecord(newFinance);
    setShowNewPaymentModal(false);
  };

  // Document Checklist Actions
  const handleFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCustomer) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const updatedDocs = selectedCustomer.documents.map((doc) => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'terupload' as KprDocumentStatus,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          uploadDate: new Date().toISOString().split('T')[0],
          fileUrl: URL.createObjectURL(file),
        };
      }
      return doc;
    });

    autoUpdateCustomerStatus(selectedCustomer, updatedDocs);
  };

  const handleStatusChange = (docId: string, newStatus: KprDocumentStatus) => {
    if (!selectedCustomer) return;
    const updatedDocs = selectedCustomer.documents.map((doc) => {
      if (doc.id === docId) {
        return { ...doc, status: newStatus };
      }
      return doc;
    });

    autoUpdateCustomerStatus(selectedCustomer, updatedDocs);
  };

  const handleDeleteAttachment = (docId: string) => {
    if (!selectedCustomer) return;
    const updatedDocs = selectedCustomer.documents.map((doc) => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'belum_ada' as KprDocumentStatus,
          fileName: undefined,
          fileSize: undefined,
          uploadDate: undefined,
          fileUrl: undefined,
        };
      }
      return doc;
    });

    autoUpdateCustomerStatus(selectedCustomer, updatedDocs);
  };

  const handleDeleteDocItem = (docId: string) => {
    if (!selectedCustomer) return;
    if (!window.confirm('Hapus item persyaratan dokumen ini dari checklist?')) return;
    const updatedDocs = selectedCustomer.documents.filter((doc) => doc.id !== docId);
    autoUpdateCustomerStatus(selectedCustomer, updatedDocs);
  };

  const handleAddCustomDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newDocName) return;

    const newDoc: KprDocumentItem = {
      id: `doc-${Date.now()}`,
      code: `custom-${Date.now().toString().slice(-4)}`,
      name: newDocName,
      category: newDocCategory,
      isRequired: newDocIsRequired,
      status: 'belum_ada',
      notes: newDocNotes,
    };

    const updatedDocs = [...selectedCustomer.documents, newDoc];
    autoUpdateCustomerStatus(selectedCustomer, updatedDocs);
    setShowAddDocModal(false);
    setNewDocName('');
    setNewDocNotes('');
  };

  const handleSaveEditedDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !editingDoc) return;

    const updatedDocs = selectedCustomer.documents.map((d) => (d.id === editingDoc.id ? editingDoc : d));
    autoUpdateCustomerStatus(selectedCustomer, updatedDocs);
    setEditingDoc(null);
  };

  const autoUpdateCustomerStatus = (customer: CustomerProfile, docs: KprDocumentItem[]) => {
    const requiredDocs = docs.filter((d) => d.isRequired);
    const verifiedRequired = requiredDocs.filter((d) => d.status === 'terverifikasi' || d.status === 'terupload');

    let overallStatus: CustomerProfile['statusPemberkasan'] = 'Belum Lengkap';
    if (requiredDocs.length > 0 && verifiedRequired.length === requiredDocs.length) {
      overallStatus = 'Lengkap & Terverifikasi';
    } else if (verifiedRequired.length > 0) {
      overallStatus = 'Dalam Proses Bank';
    }

    const updatedCustomer: CustomerProfile = {
      ...customer,
      documents: docs,
      statusPemberkasan: overallStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateCustomer(updatedCustomer);
  };

  // Filter financial records matching selected customer
  const customerPayments = selectedCustomer
    ? finances.filter((f) => {
        if (f.isDeleted) return false;
        const nameMatch = f.payerName && f.payerName.toLowerCase() === selectedCustomer.name.toLowerCase();
        const unitMatch = f.unitCode && f.unitCode.toLowerCase() === selectedCustomer.unitCode.toLowerCase();
        const titleMatch = f.title.toLowerCase().includes(selectedCustomer.name.toLowerCase()) || f.title.toLowerCase().includes(selectedCustomer.unitCode.toLowerCase());
        return nameMatch || unitMatch || titleMatch;
      })
    : [];

  const totalCustomerPaid = customerPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // Matching sale transaction if exists
  const matchingSale = sales.find(
    (s) => s.unitCode.toLowerCase() === selectedCustomer?.unitCode.toLowerCase() || s.buyer.nik === selectedCustomer?.nik
  );

  const agreedPrice = matchingSale ? matchingSale.agreedPrice : selectedCustomer ? selectedCustomer.kprPlafonRequest + 30000000 : 0;
  const remainingDebt = Math.max(0, agreedPrice - totalCustomerPaid);

  const getDocStatusBadge = (status: KprDocumentStatus) => {
    switch (status) {
      case 'terverifikasi':
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] flex items-center gap-1 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
          </span>
        );
      case 'terupload':
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-[10px] flex items-center gap-1 border border-blue-200">
            <FileText className="w-3 h-3 text-blue-600" /> Ter-Upload
          </span>
        );
      case 'ditolak':
        return (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold text-[10px] flex items-center gap-1 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Perlu Perbaikan
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold text-[10px] flex items-center gap-1 border border-slate-200">
            <AlertCircle className="w-3 h-3 text-slate-400" /> Belum Ada
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner for Sales Marketing Role */}
      {isSalesMarketing && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center gap-2.5 font-bold shadow-sm">
          <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Mode Akses Marketing: Menampilkan khusus berkas & data konsumen KPR milik Anda (<strong>{currentUser?.name}</strong>)
          </span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-extrabold">
            <FolderCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Kelola Data User, Berkas KPR & History Pembayaran
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data identitas konsumen, data perusahaan tempat bekerja, checklist berkas KPR, serta kartu piutang & history pembayaran.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Konsumen / User Baru</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total User Konsumen</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCustomersCount} Person</p>
            <p className="text-[10px] text-slate-400">Terdaftar di ERP Yusuf Property</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Berkas Lengkap 100%</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{completeCustomersCount} Konsumen</p>
            <p className="text-[10px] text-emerald-600">Siap Submit ke Bank Mitra</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Proses Pemberkasan</p>
            <p className="text-2xl font-black text-amber-700 mt-1">{inProgressCustomersCount} Konsumen</p>
            <p className="text-[10px] text-amber-600">Perlu Pengumpulan & Verifikasi</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UploadCloud className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-xl gap-2 w-fit">
        <button
          onClick={() => setActiveSubTab('user_files')}
          className={`px-4 py-2 rounded-lg font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'user_files'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderCheck className="w-4 h-4 text-emerald-600" />
          <span>1. Checklist Berkas KPR & Data Perusahaan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payment_history')}
          className={`px-4 py-2 rounded-lg font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'payment_history'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-amber-600" />
          <span>2. Pencarian History Pembayaran User & Kartu Piutang</span>
        </button>
      </div>

      {/* View Mode 1: Checklist Berkas KPR */}
      {activeSubTab === 'user_files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customer List */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Daftar Konsumen KPR</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                    {filteredCustomers.length}
                  </span>
                </h3>
              </div>

              {/* Search & Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari Nama, NIK, Blok Unit, Perusahaan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                      filterStatus === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({customers.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('Belum Lengkap')}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                      filterStatus === 'Belum Lengkap'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    Belum Lengkap
                  </button>
                  <button
                    onClick={() => setFilterStatus('Lengkap & Terverifikasi')}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                      filterStatus === 'Lengkap & Terverifikasi'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    Lengkap 100%
                  </button>
                </div>
              </div>

              {/* Customers Item List */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredCustomers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    Belum ada data konsumen terdaftar. Klik &quot;Tambah Konsumen&quot; di atas.
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    const reqCount = cust.documents.filter((d) => d.isRequired).length;
                    const verifiedCount = cust.documents.filter(
                      (d) => d.isRequired && (d.status === 'terverifikasi' || d.status === 'terupload')
                    ).length;
                    const percent = reqCount > 0 ? Math.round((verifiedCount / reqCount) * 100) : 0;

                    return (
                      <div
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{cust.name}</span>
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Unit {cust.unitCode}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">NIK: {cust.nik}</div>
                          </div>
                          {cust.statusPemberkasan === 'Lengkap & Terverifikasi' ? (
                            <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-black">
                              LENGKAP
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black">
                              {percent}%
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-600 flex items-center justify-between border-t border-slate-100 pt-1.5">
                          <span className="flex items-center gap-1 text-slate-500 truncate">
                            <Briefcase className="w-3 h-3 text-slate-400" /> {cust.companyName || cust.jobTitle}
                          </span>
                          <span className="font-bold text-slate-700">{cust.kprBankTarget}</span>
                        </div>

                        {/* Mini Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              percent === 100 ? 'bg-emerald-500' : percent > 50 ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {selectedCustomer && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">Total {selectedCustomer.documents.length} item checklist</span>
                <button
                  onClick={() => handleDeleteCustomerProfile(selectedCustomer.id)}
                  className="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Konsumen
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Customer Details & Checklist Documents */}
          <div className="lg:col-span-8 space-y-5">
            {!selectedCustomer ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm text-center text-slate-400 text-xs">
                Pilih konsumen di sebelah kiri untuk melihat detail data perusahaan & checklist berkas KPR.
              </div>
            ) : (
              <>
                {/* Customer Info Card Header */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase">
                          Unit Blok {selectedCustomer.unitCode}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{selectedCustomer.projectName}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mt-1">{selectedCustomer.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>NIK: <strong className="text-slate-200 font-mono">{selectedCustomer.nik}</strong></span>
                        <span>•</span>
                        <span>No HP: <strong className="text-slate-200">{selectedCustomer.phone}</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOpenEditCustomer}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Data User
                      </button>
                    </div>
                  </div>

                  {/* Company & KPR Target Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                      <span className="text-[10px] text-slate-400 block font-semibold">Pekerjaan / Perusahaan</span>
                      <span className="font-bold text-white block mt-0.5 truncate">
                        {selectedCustomer.companyName || selectedCustomer.jobTitle}
                      </span>
                      <span className="text-[10px] text-slate-400">{selectedCustomer.jobTitle}</span>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                      <span className="text-[10px] text-slate-400 block font-semibold">Penghasilan Bulan (Gaji)</span>
                      <span className="font-black text-emerald-400 block mt-0.5">
                        {formatRupiah(selectedCustomer.monthlyIncome)}
                      </span>
                      <span className="text-[10px] text-slate-400">{selectedCustomer.maritalStatus}</span>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                      <span className="text-[10px] text-slate-400 block font-semibold">Bank Mitra Pengajuan KPR</span>
                      <span className="font-bold text-amber-300 block mt-0.5">{selectedCustomer.kprBankTarget}</span>
                      <span className="text-[10px] text-slate-400">Plafon {formatRupiah(selectedCustomer.kprPlafonRequest)}</span>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                      <span className="text-[10px] text-slate-400 block font-semibold">Status Kelengkapan</span>
                      <span className="font-extrabold text-emerald-400 block mt-0.5">
                        {selectedCustomer.statusPemberkasan}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Update: {formatDate(selectedCustomer.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Completeness Bar */}
                  {(() => {
                    const reqs = selectedCustomer.documents.filter((d) => d.isRequired);
                    const verifs = reqs.filter((d) => d.status === 'terverifikasi' || d.status === 'terupload').length;
                    const pct = reqs.length > 0 ? Math.round((verifs / reqs.length) * 100) : 0;
                    return (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-bold text-slate-300">
                          <span>Progress Kelengkapan Dokumen Wajib: {verifs} dari {reqs.length} Dokumen ({pct}%)</span>
                          <span className="text-amber-400 font-black">{pct}% Selesai</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Checklist Section Header & Add Custom Item */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>Checklist Kelengkapan Berkas Dokumen KPR & Perusahaan</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Upload file scan/foto per masing-masing dokumen persyaratkan KPR di bawah ini.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddDocModal(true)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Syarat Dokumen
                    </button>
                  </div>

                  {/* Group documents by category */}
                  {(
                    [
                      'Identitas Pribadi',
                      'Dokumen Legalitas',
                      'Penghasilan & Pekerjaan',
                      'Formulir Bank & Perusahaan',
                    ] as const
                  ).map((catName) => {
                    const catDocs = selectedCustomer.documents.filter((d) => d.category === catName);
                    if (catDocs.length === 0) return null;

                    return (
                      <div key={catName} className="space-y-2.5 pt-1">
                        <div className="bg-slate-50 px-3 py-1.5 rounded-lg font-bold text-slate-800 text-xs flex justify-between items-center border border-slate-200">
                          <span>{catName}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {catDocs.filter((d) => d.status === 'terverifikasi' || d.status === 'terupload').length} / {catDocs.length} Ada
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                          {catDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                            >
                              {/* Left Document Info */}
                              <div className="space-y-1 max-w-md">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-slate-900">{doc.name}</span>
                                  {doc.isRequired ? (
                                    <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 font-extrabold text-[9px] rounded uppercase">
                                      Wajib
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 font-bold text-[9px] rounded uppercase">
                                      Opsional
                                    </span>
                                  )}
                                </div>

                                {doc.notes && (
                                  <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                                    <span>💡</span> {doc.notes}
                                  </p>
                                )}

                                {/* Uploaded File Info */}
                                {doc.fileName ? (
                                  <div className="p-2 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-900 text-xs flex items-center justify-between gap-2 mt-1">
                                    <div className="flex items-center gap-2 truncate">
                                      <Paperclip className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                      <span className="font-bold truncate">{doc.fileName}</span>
                                      <span className="text-[10px] text-emerald-700 font-mono">({doc.fileSize})</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <a
                                        href={doc.fileUrl || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-bold text-emerald-800 hover:underline flex items-center gap-0.5"
                                      >
                                        <Eye className="w-3 h-3" /> Lihat
                                      </a>
                                      <button
                                        onClick={() => handleDeleteAttachment(doc.id)}
                                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 ml-1"
                                        title="Hapus File Terlampir"
                                      >
                                        <Trash2 className="w-3 h-3" /> Hapus
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400 font-medium">Belum ada file ter-upload</div>
                                )}
                              </div>

                              {/* Right Actions: Status & Upload Control */}
                              <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
                                {getDocStatusBadge(doc.status)}

                                {/* Custom Upload Button */}
                                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all">
                                  <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                                  <span>{doc.fileName ? 'Ganti File' : 'Upload File'}</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={(e) => handleFileUpload(doc.id, e)}
                                  />
                                </label>

                                {/* Change Status Dropdown */}
                                <select
                                  value={doc.status}
                                  onChange={(e) => handleStatusChange(doc.id, e.target.value as KprDocumentStatus)}
                                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                                >
                                  <option value="belum_ada">Belum Ada</option>
                                  <option value="terupload">Ter-Upload</option>
                                  <option value="terverifikasi">Terverifikasi</option>
                                  <option value="ditolak">Ditolak / Revisi</option>
                                </select>

                                {/* Edit & Delete Doc Item */}
                                <button
                                  onClick={() => setEditingDoc(doc)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                                  title="Edit Persyaratan"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDocItem(doc.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                                  title="Hapus Dari Checklist"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* View Mode 2: History Pembayaran User & Kartu Piutang */}
      {activeSubTab === 'payment_history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customer Picker */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Pilih Konsumen Untuk History Bayar
              </h3>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari Nama, NIK, No HP, Blok Unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredCustomers.map((cust) => {
                  const isSelected = selectedCustomer?.id === cust.id;
                  const custPays = finances.filter(
                    (f) =>
                      !f.isDeleted &&
                      (f.payerName?.toLowerCase() === cust.name.toLowerCase() ||
                        f.unitCode?.toLowerCase() === cust.unitCode.toLowerCase() ||
                        f.title.toLowerCase().includes(cust.name.toLowerCase()))
                  );
                  const totalPaid = custPays.reduce((acc, curr) => acc + curr.amount, 0);

                  return (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-1 ring-amber-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-900">{cust.name}</span>
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                          Blok {cust.unitCode}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">NIK: {cust.nik}</div>
                      <div className="text-[11px] font-black text-emerald-700 flex justify-between border-t border-slate-100 pt-1.5">
                        <span>Total Terbayar:</span>
                        <span>{formatRupiah(totalPaid)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Kartu Piutang & Jurnal History Pembayaran */}
          <div className="lg:col-span-8 space-y-5">
            {!selectedCustomer ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm text-center text-slate-400 text-xs">
                Pilih konsumen untuk menampilkan Kartu Piutang & History Pembayaran.
              </div>
            ) : (
              <>
                {/* Kartu Piutang Overview Card */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span>KARTU PIUTANG & BUKTI BAYAR KONSUMEN</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mt-1">{selectedCustomer.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Unit Kavling: <strong className="text-slate-200">Blok {selectedCustomer.unitCode}</strong> ({selectedCustomer.projectName})
                      </p>
                    </div>

                    <button
                      onClick={() => setShowNewPaymentModal(true)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Input Pembayaran User Baru</span>
                    </button>
                  </div>

                  {/* Payment Breakdown Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
                      <span className="text-[10px] text-slate-400 block font-semibold">Harga Kesepakatan Unit</span>
                      <span className="font-black text-white text-lg block mt-0.5">{formatRupiah(agreedPrice)}</span>
                      <span className="text-[10px] text-slate-400">Skema / KPR Target: {selectedCustomer.kprBankTarget}</span>
                    </div>

                    <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
                      <span className="text-[10px] text-slate-400 block font-semibold">Total Pembayaran Masuk</span>
                      <span className="font-black text-emerald-400 text-lg block mt-0.5">{formatRupiah(totalCustomerPaid)}</span>
                      <span className="text-[10px] text-emerald-300 font-bold">{customerPayments.length} Transaksi Terbayar</span>
                    </div>

                    <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
                      <span className="text-[10px] text-slate-400 block font-semibold">Sisa Piutang / Kekurangan</span>
                      <span className="font-black text-amber-400 text-lg block mt-0.5">{formatRupiah(remainingDebt)}</span>
                      <span className="text-[10px] text-amber-300 font-bold">
                        {remainingDebt === 0 ? 'LUNAS SELESAI' : 'PROSES ANGSURAN'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline History Table */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-600" />
                        <span>History Jurnal Transaksi Pembayaran</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rekam jejak seluruh setoran UTJ, DP, dan angsuran yang tercatat di Jurnal Keuangan ERP.
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">No. Ref / Tanggal</th>
                          <th className="p-3">Uraian / Kategori Pembayaran</th>
                          <th className="p-3">Metode Bayar</th>
                          <th className="p-3 text-right">Nominal (Rp)</th>
                          <th className="p-3 text-center">Cetak Kuitansi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerPayments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                              Belum ada catatan transaksi pembayaran untuk konsumen ini.
                            </td>
                          </tr>
                        ) : (
                          customerPayments.map((pay) => (
                            <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <div className="font-mono font-bold text-slate-900">{pay.refNumber || 'KWT-REG'}</div>
                                <div className="text-[10px] text-slate-500">{pay.date}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900">{pay.title}</div>
                                <div className="text-[10px] text-emerald-700 font-semibold uppercase">{pay.category}</div>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-[10px] text-slate-700">
                                  {pay.paymentMethod || 'Transfer Bank'}
                                </span>
                              </td>
                              <td className="p-3 text-right font-black text-emerald-700 text-sm">
                                {formatRupiah(pay.amount)}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setPrintingReceipt(pay)}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg shadow flex items-center gap-1 mx-auto transition-all"
                                >
                                  <Printer className="w-3 h-3 text-amber-400" /> Cetak
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Tambah Konsumen Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Registrasi Konsumen & Data Perusahaan KPR Baru
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveNewCustomer} className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between">
                <span>Data Pribadi & Kontak</span>
                <span className="text-[10px] text-slate-400">Formulir KPR Yusuf Property</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Konsumen *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sesuai e-KTP"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor NIK e-KTP *</label>
                  <input
                    type="text"
                    required
                    placeholder="16 digit NIK"
                    value={custNik}
                    onChange={(e) => setCustNik(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Konsumen</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pernikahan</label>
                  <select
                    value={custMaritalStatus}
                    onChange={(e) => setCustMaritalStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Menikah">Menikah</option>
                    <option value="Lajang">Lajang</option>
                    <option value="Duda / Janda">Duda / Janda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap KTP</label>
                <input
                  type="text"
                  placeholder="Jl. Mawar No. 12, RT 01/02, Kel. Sukajadi"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 pt-2">
                Data Pekerjaan & Perusahaan Tempat Bekerja
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan / Profesi</label>
                  <input
                    type="text"
                    value={custJobTitle}
                    onChange={(e) => setCustJobTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Perusahaan / PT</label>
                  <input
                    type="text"
                    placeholder="PT Telkom Indonesia Tbk"
                    value={custCompanyName}
                    onChange={(e) => setCustCompanyName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gaji Per Bulan (Rp)</label>
                  <input
                    type="number"
                    value={custMonthlyIncome}
                    onChange={(e) => setCustMonthlyIncome(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 pt-2">
                Proyek, Unit & Setoran UTJ / Booking Fee Awal (Otomatis Ke Keuangan)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Proyek *</label>
                  <select
                    value={custProjectName}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {projectOptions.map((pName) => (
                      <option key={pName} value={pName}>
                        {pName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blok Unit (Tersedia) *</label>
                  <select
                    value={custUnitCode}
                    onChange={(e) => handleUnitCodeChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {availableUnitsForRegistration.length === 0 ? (
                      <option value="">-- Tidak ada unit tersedia --</option>
                    ) : (
                      availableUnitsForRegistration.map((u) => (
                        <option key={u.id} value={u.unitCode}>
                          Blok {u.unitCode} ({u.type} - LT {u.landArea}m²/LB {u.buildingArea}m²)
                        </option>
                      ))
                    )}
                  </select>
                  {availableUnitsForRegistration.length === 0 && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                      ⚠️ Semua unit pada proyek ini sudah terbooking / terjual.
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank KPR Target</label>
                  <select
                    value={custKprBankTarget}
                    onChange={(e) => setCustKprBankTarget(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Bank BTN">Bank BTN Syariah</option>
                    <option value="Bank BSI">Bank BSI</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank BCA">Bank BCA</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plafon KPR (Rp)</label>
                  <input
                    type="number"
                    value={custKprPlafonRequest}
                    onChange={(e) => setCustKprPlafonRequest(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-900 block mb-1">Setoran Booking Fee / UTJ Awal (Rp)</label>
                  <input
                    type="number"
                    value={custUtjPaid}
                    onChange={(e) => setCustUtjPaid(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-black text-emerald-700"
                  />
                  <p className="text-[10px] text-emerald-700 mt-1">*Otomatis masuk Jurnal Keuangan Kas Masuk</p>
                </div>

                <div>
                  <label className="font-bold text-emerald-900 block mb-1">Metode Pembayaran UTJ</label>
                  <select
                    value={custPaymentMethod}
                    onChange={(e) => setCustPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-bold text-slate-800"
                  >
                    <option value="Transfer Bank BTN">Transfer Bank BTN Syariah</option>
                    <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                    <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                    <option value="Cash / Tunai Kantor">Cash / Tunai Kantor</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg"
                >
                  Simpan & Daftarkan Konsumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Customer Data */}
      {showEditCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm">Edit Profil Konsumen & Data Perusahaan</span>
              <button onClick={() => setShowEditCustomerModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditedCustomer} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIK e-KTP</label>
                  <input
                    type="text"
                    required
                    value={custNik}
                    onChange={(e) => setCustNik(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telepon / WA</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Perusahaan / PT</label>
                  <input
                    type="text"
                    value={custCompanyName}
                    onChange={(e) => setCustCompanyName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gaji Per Bulan (Rp)</label>
                  <input
                    type="number"
                    value={custMonthlyIncome}
                    onChange={(e) => setCustMonthlyIncome(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Proyek</label>
                  <select
                    value={custProjectName}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    {projectOptions.map((pName) => (
                      <option key={pName} value={pName}>
                        {pName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Blok</label>
                  <select
                    value={custUnitCode}
                    onChange={(e) => handleUnitCodeChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-700"
                  >
                    {availableUnitsForEdit.length === 0 ? (
                      <option value={custUnitCode}>{custUnitCode}</option>
                    ) : (
                      availableUnitsForEdit.map((u) => (
                        <option key={u.id} value={u.unitCode}>
                          Blok {u.unitCode} ({u.type} - {u.status === 'available' ? 'Tersedia' : 'Unit Konsumen Saat Ini'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank Mitra KPR</label>
                  <input
                    type="text"
                    value={custKprBankTarget}
                    onChange={(e) => setCustKprBankTarget(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plafon KPR (Rp)</label>
                  <input
                    type="number"
                    value={custKprPlafonRequest}
                    onChange={(e) => setCustKprPlafonRequest(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditCustomerModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Input Pembayaran User Baru */}
      {showNewPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" /> Input Pembayaran User Baru
              </span>
              <button onClick={() => setShowNewPaymentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveNewUserPayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{selectedCustomer.name}</div>
                <div className="text-[11px] text-slate-500">Unit Blok {selectedCustomer.unitCode} — {selectedCustomer.projectName}</div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Pembayaran</label>
                <select
                  value={payCategory}
                  onChange={(e) => setPayCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="booking_fee">Booking Fee / UTJ</option>
                  <option value="dp_pembayaran">Uang Muka (DP / Angsuran DP)</option>
                  <option value="pelunasan_unit">Pelunasan Cash Unit</option>
                  <option value="pencairan_kpr">Pencairan KPR Bank</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal Terbayar (Rp)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Metode Pembayaran</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Transfer Bank BTN">Transfer Bank BTN Syariah</option>
                  <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                  <option value="Cash / Tunai Kantor">Cash / Tunai Kantor</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Transaksi</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow"
                >
                  Simpan Transaksi Ke Jurnal Keuangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Tambah Syarat Dokumen Custom */}
      {showAddDocModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm">Tambah Syarat Dokumen Custom</span>
              <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddCustomDocument} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Persyaratan Dokumen *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BPJS Ketenagakerjaan / Surat Penjamin"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Dokumen</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Identitas Pribadi">Identitas Pribadi</option>
                  <option value="Dokumen Legalitas">Dokumen Legalitas</option>
                  <option value="Penghasilan & Pekerjaan">Penghasilan & Pekerjaan</option>
                  <option value="Formulir Bank & Perusahaan">Formulir Bank & Perusahaan</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqCheck"
                  checked={newDocIsRequired}
                  onChange={(e) => setNewDocIsRequired(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600"
                />
                <label htmlFor="reqCheck" className="font-bold text-slate-800">
                  Dokumen Bersifat Wajib (Mandatory)
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Instruksi</label>
                <input
                  type="text"
                  placeholder="Contoh: Harus dicetak resmi"
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  Tambahkan ke Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Edit Persyaratan Dokumen Item */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold text-sm">Edit Persyaratan Dokumen</span>
              <button onClick={() => setEditingDoc(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditedDoc} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Dokumen</label>
                <input
                  type="text"
                  required
                  value={editingDoc.name}
                  onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Dokumen</label>
                <input
                  type="text"
                  value={editingDoc.notes || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Official Receipt / Kuitansi Modal */}
      {printingReceipt && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden p-6 space-y-6 text-slate-900">
            {/* Header Letterhead */}
            <div className="border-b-2 border-amber-500 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">PT YUSUF PROPERTY INDONESIA</h2>
                <p className="text-[10px] text-slate-500 font-medium">Developer & General Contractor Perumahan Modern</p>
                <p className="text-[9px] text-slate-400">Jl. Raya Bandung-Garut No. 88, Bandung • Telp: (022) 7890123</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider block">
                  KUITANSI RESMI
                </span>
                <p className="text-[10px] font-mono font-bold text-slate-600 mt-1">No: {printingReceipt.refNumber || 'KWT/YP/001'}</p>
                <p className="text-[10px] text-slate-500">Tanggal: {printingReceipt.date}</p>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                <span className="font-bold text-slate-500">Telah Diterima Dari</span>
                <span className="col-span-2 font-black text-slate-900 text-sm">{printingReceipt.payerName || selectedCustomer.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                <span className="font-bold text-slate-500">Unit Perumahan</span>
                <span className="col-span-2 font-bold text-slate-800">
                  Unit Blok {selectedCustomer.unitCode} — {printingReceipt.projectName || selectedCustomer.projectName}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                <span className="font-bold text-slate-500">Uang Sejumlah</span>
                <span className="col-span-2 font-bold text-emerald-800 italic bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  &quot;{terbilang(printingReceipt.amount)} Rupiah&quot;
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                <span className="font-bold text-slate-500">Untuk Pembayaran</span>
                <span className="col-span-2 font-semibold text-slate-800">{printingReceipt.title}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                <span className="font-bold text-slate-500">Metode Bayar</span>
                <span className="col-span-2 font-bold text-slate-700">{printingReceipt.paymentMethod}</span>
              </div>

              {/* Total Box */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <span className="font-bold text-amber-400 text-xs">JUMLAH TERBAYAR:</span>
                <span className="font-black text-2xl text-emerald-400">{formatRupiah(printingReceipt.amount)}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 text-center text-[10px] pt-4 border-t border-slate-200">
              <div>
                <p className="text-slate-500">Penyetor / Konsumen</p>
                <div className="h-14"></div>
                <p className="font-bold text-slate-900 underline">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Bandung, {printingReceipt.date}</p>
                <p className="text-slate-500">Kasir Keuangan PT Yusuf Property</p>
                <div className="h-10"></div>
                <p className="font-bold text-slate-900 underline">{printingReceipt.recordedBy || 'Finance Dept'}</p>
              </div>
            </div>

            {/* Print & Close Controls */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 print:hidden">
              <button
                onClick={() => setPrintingReceipt(null)}
                className="px-4 py-2 text-slate-600 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Cetak Kuitansi SEKARANG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
