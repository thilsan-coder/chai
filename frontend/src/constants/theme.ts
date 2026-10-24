export const BUSINESS_CONFIG = {
  name: 'Oonjal Chai',
  tagline: 'Sri Lankan Chai Cafe & Fast Food',
  currency: 'LKR',
  currencySymbol: 'Rs.',
  timezone: 'Asia/Colombo',
  openingTime: '16:00', // 4:00 PM
  closingTime: '01:00', // 1:00 AM (next day)
  expectedDailyOrders: 350,
};

export const formatCurrency = (amount: number): string => {
  return `${BUSINESS_CONFIG.currencySymbol} ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const navigationSections = [
  {
    title: 'POS & Billing',
    items: [
      { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
      { name: 'POS Counter', path: '/pos', icon: 'Calculator', badge: 'Fast POS' },
      { name: 'Tables & Floor', path: '/tables', icon: 'Armchair' },
      { name: 'Orders & Tokens', path: '/orders', icon: 'Receipt', badge: 'Active' },
      { name: 'Kitchen KDS', path: '/kds', icon: 'Flame', badge: 'Live' },
    ],
  },
  {
    title: 'Customers & CRM',
    items: [
      { name: 'Customers & Loyalty', path: '/customers', icon: 'Users', badge: 'Club' },
    ],
  },
  {
    title: 'Menu & Food',
    items: [
      { name: 'Menu & Items', path: '/menu', icon: 'UtensilsCrossed' },
      { name: 'Categories', path: '/categories', icon: 'Layers' },
      { name: 'Combos & Offers', path: '/combos', icon: 'Sparkles', badge: 'Hot' },
    ],
  },
  {
    title: 'Stock & Inventory',
    items: [
      { name: 'Raw Materials', path: '/inventory', icon: 'Boxes' },
      { name: 'Purchasing & Suppliers', path: '/purchases', icon: 'Truck' },
    ],
  },
  {
    title: 'Finance & Payments',
    items: [
      { name: 'Bank Transfer Verification', path: '/bank-transfers', icon: 'Building2', badge: 'Verify' },
      { name: 'Daily Expenses', path: '/expenses', icon: 'Wallet' },
      { name: 'Reports & P&L', path: '/reports', icon: 'BarChart3' },
    ],
  },
  {
    title: 'System & Admin',
    items: [
      { name: 'Staff & Roles', path: '/users', icon: 'Users' },
      { name: 'Business Settings', path: '/settings', icon: 'Settings' },
    ],
  },
];
