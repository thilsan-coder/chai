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

          <Route
            path="inventory"
            element={
              <PlaceholderPage
                title="Raw Materials & Stock Inventory"
                subtitle="Track cafe ingredients, wastage, low stock alerts, and recipe consumption"
                partTag="Planned: Part 8"
                moduleCode="MOD-07-STOCK"
                features={[
                  'Tea powder, milk, sugar, chicken, buns, oil, sauces',
                  'Ingredient recipes linked to selling menu items',
                  'Automatic stock deduction on order completion',
                  'Low-stock alerts & minimum reorder levels',
                  'Wastage logging and inventory valuation',
                ]}
              />
            }
          />

          <Route
            path="purchases"
            element={
              <PlaceholderPage
                title="Purchasing & Supplier Management"
                subtitle="Manage supplier profiles, ingredient stock-in records, and balances"
                partTag="Planned: Part 8"
                moduleCode="MOD-08-SUPPLIERS"
                features={[
                  'Supplier directories and contact info',
                  'Purchase invoice recording (Stock-in)',
                  'Payment tracking and outstanding balances',
                  'Purchase history audit log',
                ]}
              />
            }
          />

          <Route
            path="expenses"
            element={
              <PlaceholderPage
                title="Daily Cafe Expenses"
                subtitle="Record operating costs (utilities, gas, salaries, maintenance, rent)"
                partTag="Planned: Part 9"
                moduleCode="MOD-09-EXPENSES"
                features={[
                  'Categorized expenses (Gas, Electricity, Salaries, Packaging)',
                  'Payment method (Cash, Bank)',
                  'Expense receipt attachments and notes',
                  'Business session expense segregation',
                ]}
              />
            }
          />

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

          <Route
            path="reports"
            element={
              <PlaceholderPage
                title="Financial Reports & Business Analytics"
                subtitle="Daily 4:00 PM - 1:00 AM session reports, cash vs bank breakdown, estimated P&L"
                partTag="Planned: Part 10"
                moduleCode="MOD-11-REPORTS"
                features={[
                  'Sri Lankan 4 PM - 1 AM session boundary accounting',
                  'Cash collections vs bank transfer collections',
                  'Gross sales, direct expenses, and estimated P&L',
                  'Top-selling chai, burger, and combo statistics',
                  'Exportable summaries for cafe owner',
                ]}
              />
            }
          />

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
