import React, { useState, useEffect } from 'react';
import {
  HousingProject,
  Unit,
  SalesTransaction,
  ConstructionMilestone,
  FinancialRecord,
  UnitStatus,
  KprStatus,
  AppUser,
  CustomerProfile,
  getUserAllowedTabs,
  TabType,
  MaterialItem,
  MaterialUsageRecord,
  ProgressDocumentation,
  AttendanceRecord,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_UNITS,
  INITIAL_SALES,
  INITIAL_CONSTRUCTION,
  INITIAL_FINANCE,
  INITIAL_CUSTOMERS,
  INITIAL_MATERIALS,
  INITIAL_MATERIAL_USAGES,
  INITIAL_PROGRESS_DOCS,
  INITIAL_ATTENDANCE,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { DashboardOverview } from './components/DashboardOverview';
import { ProjectsManager } from './components/ProjectsManager';
import { SiteplanViewer } from './components/SiteplanViewer';
import { SalesKprManager } from './components/SalesKprManager';
import { KprCalculator } from './components/KprCalculator';
import { ConstructionManager } from './components/ConstructionManager';
import { FinanceManager } from './components/FinanceManager';
import { ReportsManager } from './components/ReportsManager';
import { EmployeeMarketingManager } from './components/EmployeeMarketingManager';
import { AttendanceManager } from './components/AttendanceManager';
import { UserAccessManager } from './components/UserAccessManager';
import { UserDataManager, DEFAULT_DOCUMENT_TEMPLATES } from './components/UserDataManager';
import { NewTransactionModal } from './components/NewTransactionModal';
import { NewUnitModal } from './components/NewUnitModal';

export default function App() {
  // Users and Auth State
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('yp_erp_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('yp_erp_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null; // Force login screen on initial load
  });

  // Data persistence via localStorage
  const [projects, setProjects] = useState<HousingProject[]>(() => {
    const saved = localStorage.getItem('yp_erp_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('yp_erp_units');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [sales, setSales] = useState<SalesTransaction[]>(() => {
    const saved = localStorage.getItem('yp_erp_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [construction, setConstruction] = useState<ConstructionMilestone[]>(() => {
    const saved = localStorage.getItem('yp_erp_construction');
    return saved ? JSON.parse(saved) : INITIAL_CONSTRUCTION;
  });

  const [finances, setFinances] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('yp_erp_finances');
    return saved ? JSON.parse(saved) : INITIAL_FINANCE;
  });

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem('yp_erp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('yp_erp_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [materialUsages, setMaterialUsages] = useState<MaterialUsageRecord[]>(() => {
    const saved = localStorage.getItem('yp_erp_material_usages');
    return saved ? JSON.parse(saved) : INITIAL_MATERIAL_USAGES;
  });

  const [progressDocs, setProgressDocs] = useState<ProgressDocumentation[]>(() => {
    const saved = localStorage.getItem('yp_erp_progress_docs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_DOCS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('yp_erp_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [showNewTransactionModal, setShowNewTransactionModal] = useState<boolean>(false);
  const [showNewUnitModal, setShowNewUnitModal] = useState<boolean>(false);
  const [unitForSpr, setUnitForSpr] = useState<Unit | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('yp_erp_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('yp_erp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('yp_erp_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('yp_erp_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('yp_erp_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('yp_erp_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('yp_erp_construction', JSON.stringify(construction));
  }, [construction]);

  useEffect(() => {
    localStorage.setItem('yp_erp_finances', JSON.stringify(finances));
  }, [finances]);

  useEffect(() => {
    localStorage.setItem('yp_erp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('yp_erp_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('yp_erp_material_usages', JSON.stringify(materialUsages));
  }, [materialUsages]);

  useEffect(() => {
    localStorage.setItem('yp_erp_progress_docs', JSON.stringify(progressDocs));
  }, [progressDocs]);

  useEffect(() => {
    localStorage.setItem('yp_erp_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Attendance Handlers
  const handleAddAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev]);
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
  };

  const handleDeleteAttendance = (id: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Construction & Material Handlers
  const handleAddMaterial = (newMat: MaterialItem) => {
    setMaterials((prev) => [newMat, ...prev]);
  };

  const handleUpdateMaterial = (updatedMat: MaterialItem) => {
    setMaterials((prev) => prev.map((m) => (m.id === updatedMat.id ? updatedMat : m)));
  };

  const handleDeleteMaterial = (matId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== matId));
  };

  const handleAddMaterialUsage = (usageRecord: MaterialUsageRecord) => {
    // 1. Add usage record
    setMaterialUsages((prev) => [usageRecord, ...prev]);
    // 2. Reduce stock quantity in materials
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === usageRecord.materialId) {
          const newQty = Math.max(0, m.stockQty - usageRecord.quantityUsed);
          return { ...m, stockQty: newQty, lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return m;
      })
    );
  };

  const handleUpdateMaterialUsage = (updatedRecord: MaterialUsageRecord, oldQty: number) => {
    // 1. Update record with history
    setMaterialUsages((prev) => prev.map((u) => (u.id === updatedRecord.id ? updatedRecord : u)));
    // 2. Adjust stock quantity difference
    const qtyDiff = updatedRecord.quantityUsed - oldQty; // e.g. from 10 to 12 -> diff +2 (reduce stock by 2)
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === updatedRecord.materialId) {
          const newQty = Math.max(0, m.stockQty - qtyDiff);
          return { ...m, stockQty: newQty, lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return m;
      })
    );
  };

  const handleDeleteMaterialUsage = (usageId: string) => {
    const targetUsage = materialUsages.find((u) => u.id === usageId);
    if (targetUsage) {
      // Restore stock quantity
      setMaterials((prev) =>
        prev.map((m) => {
          if (m.id === targetUsage.materialId) {
            return { ...m, stockQty: m.stockQty + targetUsage.quantityUsed };
          }
          return m;
        })
      );
    }
    setMaterialUsages((prev) => prev.filter((u) => u.id !== usageId));
  };

  const handleAddProgressDoc = (newDoc: ProgressDocumentation) => {
    setProgressDocs((prev) => [newDoc, ...prev]);
    // Also update unit progressPercent in units if matching unitId exists
    if (newDoc.unitId) {
      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === newDoc.unitId) {
            return { ...u, progressPercent: newDoc.progressPercent };
          }
          return u;
        })
      );
    }
  };

  const handleDeleteProgressDoc = (docId: string) => {
    setProgressDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  // Customer Management Handlers
  const handleAddCustomer = (newCustomer: CustomerProfile) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleUpdateCustomer = (updatedCustomer: CustomerProfile) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  // Finance Update & Delete Handlers
  const handleUpdateFinanceRecord = (updatedRecord: FinancialRecord) => {
    setFinances((prev) => prev.map((f) => (f.id === updatedRecord.id ? updatedRecord : f)));
  };

  const handleDeleteFinanceRecord = (id: string, reason: string, user: string) => {
    setFinances((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              isDeleted: true,
              deletedAt: new Date().toLocaleString('id-ID'),
              deletedBy: user,
              deleteReason: reason,
            }
          : f
      )
    );
  };

  // Clean Reset Function
  const handleResetData = () => {
    setProjects([]);
    setUnits([]);
    setSales([]);
    setConstruction([]);
    setFinances([]);
    localStorage.setItem('yp_erp_projects', JSON.stringify([]));
    localStorage.setItem('yp_erp_units', JSON.stringify([]));
    localStorage.setItem('yp_erp_sales', JSON.stringify([]));
    localStorage.setItem('yp_erp_construction', JSON.stringify([]));
    localStorage.setItem('yp_erp_finances', JSON.stringify([]));
  };

  // User Management Handlers
  const handleAddUser = (newUser: AppUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Project Management Handlers
  const handleAddProject = (newProject: HousingProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleUpdateProject = (updatedProject: HousingProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setUnits((prev) => prev.filter((u) => u.projectId !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId('all');
    }
  };

  // Transaction Handlers
  const handleCreateTransaction = (newSales: SalesTransaction) => {
    setSales([newSales, ...sales]);

    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.id === newSales.unitId) {
          return {
            ...u,
            status: newSales.paymentType === 'cash_keras' ? 'sold' : 'booking',
            notes: `Booking SPR ${newSales.sprNumber} oleh ${newSales.buyer.name}`,
          };
        }
        return u;
      })
    );

    const nowStr = new Date().toLocaleString('id-ID');
    const recordedBy = currentUser ? currentUser.name : 'System Auto-ERP';

    // Auto record Booking Fee (UTJ) to financial journal
    if (newSales.bookingFeePaid > 0) {
      const bookingRecord: FinancialRecord = {
        id: `fin-${Date.now()}-utj`,
        date: newSales.transactionDate,
        type: 'income',
        category: 'booking_fee',
        title: `Penerimaan UTJ / Booking Fee SPR ${newSales.sprNumber} - Unit ${newSales.unitCode} a.n. ${newSales.buyer.name}`,
        amount: newSales.bookingFeePaid,
        projectName: newSales.projectName,
        unitCode: newSales.unitCode,
        paymentMethod: 'Transfer Bank BTN',
        payerName: newSales.buyer.name,
        payerRelationship: 'Konsumen Langsung (Pribadi)',
        refNumber: `UTJ/YP/${newSales.sprNumber.split('/').pop()}`,
        recordedBy,
        auditLogs: [
          {
            id: `log-${Date.now()}-1`,
            timestamp: nowStr,
            action: 'CREATE',
            user: recordedBy,
            reason: 'Otomatisasi pencatatan UTJ dari transaksi SPR baru',
            changesSummary: `Penerimaan UTJ Rp ${newSales.bookingFeePaid.toLocaleString('id-ID')}`,
          },
        ],
      };
      setFinances((prev) => [bookingRecord, ...prev]);
    }

    // Auto record DP to financial journal if paid
    if (newSales.dpPaid > 0) {
      const dpRecord: FinancialRecord = {
        id: `fin-${Date.now()}-dp`,
        date: newSales.transactionDate,
        type: 'income',
        category: 'dp_pembayaran',
        title: `Penerimaan Uang Muka (DP) SPR ${newSales.sprNumber} - Unit ${newSales.unitCode} a.n. ${newSales.buyer.name}`,
        amount: newSales.dpPaid,
        projectName: newSales.projectName,
        unitCode: newSales.unitCode,
        paymentMethod: 'Transfer Bank BTN',
        payerName: newSales.buyer.name,
        payerRelationship: 'Konsumen Langsung (Pribadi)',
        refNumber: `DP/YP/${newSales.sprNumber.split('/').pop()}`,
        recordedBy,
        auditLogs: [
          {
            id: `log-${Date.now()}-2`,
            timestamp: nowStr,
            action: 'CREATE',
            user: recordedBy,
            reason: 'Otomatisasi pencatatan DP dari transaksi SPR baru',
            changesSummary: `Penerimaan DP Rp ${newSales.dpPaid.toLocaleString('id-ID')}`,
          },
        ],
      };
      setFinances((prev) => [dpRecord, ...prev]);
    }

    // Auto sync Customer Profile in User Data Manager
    setCustomers((prevCusts) => {
      const existing = prevCusts.find(
        (c) => c.nik === newSales.buyer.nik || c.name.toLowerCase() === newSales.buyer.name.toLowerCase()
      );
      if (existing) {
        return prevCusts.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                unitCode: newSales.unitCode,
                projectName: newSales.projectName,
                kprPlafonRequest: newSales.agreedPrice - newSales.dpPaid,
              }
            : c
        );
      } else {
        const newCustomer: CustomerProfile = {
          id: `cust-${Date.now()}`,
          name: newSales.buyer.name,
          nik: newSales.buyer.nik,
          phone: newSales.buyer.phone,
          email: newSales.buyer.email,
          address: newSales.buyer.address,
          maritalStatus: 'Menikah',
          jobTitle: newSales.buyer.job || 'Karyawan',
          companyName: '-',
          monthlyIncome: newSales.buyer.monthlyIncome || 10000000,
          projectName: newSales.projectName,
          unitCode: newSales.unitCode,
          kprBankTarget: newSales.kprBank || 'Bank BTN',
          kprPlafonRequest: newSales.agreedPrice - newSales.dpPaid,
          statusPemberkasan: 'Belum Lengkap',
          documents: DEFAULT_DOCUMENT_TEMPLATES.map((tmpl, idx) => ({
            id: `doc-${Date.now()}-${idx}`,
            code: tmpl.code,
            name: tmpl.name,
            category: tmpl.category,
            isRequired: tmpl.isRequired,
            status: 'belum_ada',
            notes: tmpl.notes,
          })),
          createdAt: newSales.transactionDate,
          updatedAt: newSales.transactionDate,
        };
        return [newCustomer, ...prevCusts];
      }
    });

    setShowNewTransactionModal(false);
    setUnitForSpr(null);
  };

  const handleCreateUnit = (newUnit: Unit) => {
    setUnits((prev) => [newUnit, ...prev]);
    setShowNewUnitModal(false);
  };

  const handleUpdateKprStatus = (saleId: string, nextStatus: KprStatus) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id === saleId) {
          return {
            ...s,
            kprStatus: nextStatus,
          };
        }
        return s;
      })
    );
  };

  const handleUpdateUnitStatus = (unitId: string, newStatus: UnitStatus) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status: newStatus } : u))
    );
  };

  const handleUpdateUnit = (updatedUnit: Unit) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u))
    );
  };

  const handleUpdateConstructionProgress = (id: string, newProgress: number) => {
    setConstruction((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            progressPercent: newProgress,
            status: newProgress >= 100 ? 'completed' : 'in_progress',
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return c;
      })
    );

    const milestone = construction.find((c) => c.id === id);
    if (milestone) {
      setUnits((prevUnits) =>
        prevUnits.map((u) => (u.id === milestone.unitId ? { ...u, progressPercent: newProgress } : u))
      );
    }
  };

  const handleAddFinanceRecord = (record: FinancialRecord) => {
    setFinances((prev) => [record, ...prev]);
  };

  // Active tab permission auto-guard
  const userAllowedTabs = getUserAllowedTabs(currentUser);
  useEffect(() => {
    if (currentUser && !userAllowedTabs.includes(activeTab)) {
      setActiveTab(userAllowedTabs[0] || 'dashboard');
    }
  }, [currentUser, activeTab, userAllowedTabs]);

  // If not logged in, display Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        onLoginSuccess={(u) => setCurrentUser(u)}
      />
    );
  }

  // Stock counters
  const totalUnitsCount = units.length;
  const availableUnitsCount = units.filter((u) => u.status === 'available').length;
  const bookingUnitsCount = units.filter((u) => u.status === 'booking').length;
  const soldUnitsCount = units.filter((u) => u.status === 'sold').length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* Top Header */}
      <Navbar
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        selectedProject={selectedProjectId}
        setSelectedProject={setSelectedProjectId}
        projects={projects}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenNewTransaction={() => {
          setUnitForSpr(null);
          setShowNewTransactionModal(true);
        }}
        onOpenNewUnit={() => setShowNewUnitModal(true)}
        onOpenKprCalc={() => setActiveTab('kpr_calc')}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          unitsCount={{
            total: totalUnitsCount,
            available: availableUnitsCount,
            booking: bookingUnitsCount,
            sold: soldUnitsCount,
          }}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          
          {activeTab === 'dashboard' && (
            <DashboardOverview
              projects={projects}
              units={units}
              sales={sales}
              construction={construction}
              finances={finances}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenNewTransaction={() => setShowNewTransactionModal(true)}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onSelectProjectForSiteplan={(pId) => {
                setSelectedProjectId(pId);
                setActiveTab('siteplan');
              }}
            />
          )}

          {activeTab === 'siteplan' && (
            <SiteplanViewer
              projects={projects}
              units={units}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              onSelectUnitForSpr={(unit) => {
                setUnitForSpr(unit);
                setShowNewTransactionModal(true);
              }}
              onOpenNewUnitModal={() => setShowNewUnitModal(true)}
              onUpdateUnitStatus={handleUpdateUnitStatus}
              onUpdateUnit={handleUpdateUnit}
            />
          )}

          {activeTab === 'sales' && (
            <SalesKprManager
              sales={sales}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenNewTransaction={() => setShowNewTransactionModal(true)}
              onUpdateKprStatus={handleUpdateKprStatus}
            />
          )}

          {activeTab === 'user_data' && (
            <UserDataManager
              customers={customers}
              sales={sales}
              finances={finances}
              units={units}
              projects={projects}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddFinanceRecord={handleAddFinanceRecord}
              onUpdateUnitStatus={handleUpdateUnitStatus}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeMarketingManager
              users={users}
              sales={sales}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceManager
              attendanceRecords={attendanceRecords}
              users={users}
              projects={projects}
              currentUser={currentUser}
              onAddAttendance={handleAddAttendance}
              onUpdateAttendance={handleUpdateAttendance}
              onDeleteAttendance={handleDeleteAttendance}
            />
          )}

          {activeTab === 'user_access' && (
            <UserAccessManager
              users={users}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'kpr_calc' && <KprCalculator />}

          {activeTab === 'construction' && (
            <ConstructionManager
              construction={construction}
              projects={projects}
              units={units}
              materials={materials}
              materialUsages={materialUsages}
              progressDocs={progressDocs}
              onUpdateProgress={handleUpdateConstructionProgress}
              onAddMaterial={handleAddMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onAddMaterialUsage={handleAddMaterialUsage}
              onUpdateMaterialUsage={handleUpdateMaterialUsage}
              onDeleteMaterialUsage={handleDeleteMaterialUsage}
              onAddProgressDoc={handleAddProgressDoc}
              onDeleteProgressDoc={handleDeleteProgressDoc}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceManager
              finances={finances}
              onAddFinanceRecord={handleAddFinanceRecord}
              onUpdateFinanceRecord={handleUpdateFinanceRecord}
              onDeleteFinanceRecord={handleDeleteFinanceRecord}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsManager
              projects={projects}
              units={units}
              sales={sales}
              finances={finances}
            />
          )}

        </main>

      </div>

      {/* Global Modals */}
      {showNewTransactionModal && (
        <NewTransactionModal
          units={units}
          preselectedUnit={unitForSpr}
          onClose={() => {
            setShowNewTransactionModal(false);
            setUnitForSpr(null);
          }}
          onSubmit={handleCreateTransaction}
        />
      )}

      {showNewUnitModal && (
        <NewUnitModal
          projects={projects}
          onClose={() => setShowNewUnitModal(false)}
          onSubmit={handleCreateUnit}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-center py-4 text-xs font-medium">
        <p>© 2026 PT Yusuf Property Indonesia. All rights reserved. — Sistem ERP Developer Perumahan Terpadu</p>
      </footer>

    </div>
  );
}
