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
import { CombosPage } from './pages/CombosPage';
import { BankTransfersPage } from './pages/BankTransfersPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
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

          <Route path="combos" element={<CombosPage />} />

          <Route path="inventory" element={<InventoryPage />} />
          <Route path="purchases" element={<PurchasesPage />} />

          <Route path="expenses" element={<ExpensesPage />} />

          <Route path="bank-transfers" element={<BankTransfersPage />} />

          <Route path="reports" element={<ReportsPage />} />

          <Route path="users" element={<UsersPage />} />

          <Route path="settings" element={<SettingsPage />} />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
};

export default App;
