import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PosPage } from './pages/PosPage';
import { OrdersPage } from './pages/OrdersPage';
import { KdsPage } from './pages/KdsPage';
import { TablesPage } from './pages/TablesPage';
import { MenuPage } from './pages/MenuPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { CustomersPage } from './pages/CustomersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { AuthProvider } from './context/AuthContext';


export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>

          <Route index element={<DashboardPage />} />

          <Route path="pos" element={<PosPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="kds" element={<KdsPage />} />
          <Route path="customers" element={<CustomersPage />} />

          <Route path="menu" element={<MenuPage />} />
          <Route path="categories" element={<CategoriesPage />} />


          <Route
            path="combos"
            element={
              <PlaceholderPage
                title="Combo Offers & Promotions"
                subtitle="Create bundle deals (e.g. Burger + Mojito combo) with custom discounts"
                partTag="Planned: Part 7"
                moduleCode="MOD-06-COMBOS"
                features={[
                  'Multi-product bundle configuration',
                  'Regular vs combo discounted price calculation',
                  'Savings banner for customers',
                  'Start and end validity dates',
                  'Stock deduction for individual ingredients',
                ]}
              />
            }
          />

          <Route path="inventory" element={<InventoryPage />} />
          <Route path="purchases" element={<PurchasesPage />} />

          <Route path="expenses" element={<ExpensesPage />} />

          <Route
            path="bank-transfers"
            element={
              <PlaceholderPage
                title="Bank Transfer Verification"
                subtitle="Owner workflow for verifying customer bank transfer slips and references"
                partTag="Planned: Part 6"
                moduleCode="MOD-10-BANK"
                features={[
                  'Bank transfer reference and amount checking',
                  'Slip / proof review workflow',
                  'Owner approval & reject buttons',
                  'Verified by and verification timestamp log',
                  'Prevent automatic verification without owner review',
                ]}
              />
            }
          />

          <Route path="reports" element={<ReportsPage />} />

          <Route
            path="users"
            element={
              <PlaceholderPage
                title="Staff & Role-Based Access"
                subtitle="Owner, Manager, Cashier, Kitchen staff, and Stock manager roles"
                partTag="Planned: Part 11"
                moduleCode="MOD-12-ROLES"
                features={[
                  'Role-based permissions (Owner, Cashier, Kitchen)',
                  'Staff login credentials and shift tracking',
                  'Restricted financial reports & verification access',
                  'Audit trail for sensitive actions',
                ]}
              />
            }
          />

          <Route
            path="settings"
            element={
              <PlaceholderPage
                title="Business Settings & Configuration"
                subtitle="Cafe profile, Sri Lankan Rupee formatting, token reset rules, and shift hours"
                partTag="Planned: Part 11"
                moduleCode="MOD-13-SETTINGS"
                features={[
                  'Oonjal Chai store profile and official logo display',
                  'Operating hours (4:00 PM – 1:00 AM Asia/Colombo)',
                  'Daily token numbering reset rules',
                  'Receipt header and footer customization',
                  'Thermal printer template setup',
                ]}
              />
            }
          />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
};

export default App;
